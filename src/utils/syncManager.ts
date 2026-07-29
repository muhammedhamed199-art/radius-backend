import { safeStorage, setSyncingFromRemote, setStorageChangeListener } from "./storage";

export type SyncStatus = 'connected' | 'syncing' | 'disconnected';

export interface SyncFailureLog {
  id: string;
  timestamp: string;
  type: 'push' | 'fetch';
  endpoint: string;
  statusCode?: number;
  errorMessage: string;
  payloadSummary?: string;
}

// Tab ID to prevent self-triggering via BroadcastChannel
const TAB_ID = typeof Math !== "undefined" ? Math.random().toString(36).substring(2, 9) : "tab_1";

let clientLastSyncTime = 0;
let currentSyncStatus: SyncStatus = 'connected';
let syncPausedUntil = 0; // Cooldown timer when 429 Rate Exceeded occurs
let isFetchingRemote = false;
let lastFetchExecutionTime = 0;

type SyncCallback = (allData: Record<string, any>) => void;
type SyncStatusCallback = (status: SyncStatus) => void;
type FailureCallback = (failures: SyncFailureLog[]) => void;

const listeners: SyncCallback[] = [];
const statusListeners: SyncStatusCallback[] = [];
const failureLogs: SyncFailureLog[] = [];
const failureListeners: FailureCallback[] = [];

export function getSyncStatus(): SyncStatus {
  return currentSyncStatus;
}

export function registerSyncStatusListener(callback: SyncStatusCallback) {
  statusListeners.push(callback);
  callback(currentSyncStatus);
  return () => {
    const idx = statusListeners.indexOf(callback);
    if (idx !== -1) statusListeners.splice(idx, 1);
  };
}

function setStatus(status: SyncStatus) {
  currentSyncStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

export function getSyncFailures(): SyncFailureLog[] {
  return [...failureLogs];
}

export function registerSyncFailureListener(callback: FailureCallback) {
  failureListeners.push(callback);
  callback([...failureLogs]);
  return () => {
    const idx = failureListeners.indexOf(callback);
    if (idx !== -1) failureListeners.splice(idx, 1);
  };
}

export function recordSyncFailure(failure: Omit<SyncFailureLog, 'id' | 'timestamp'>) {
  const newLog: SyncFailureLog = {
    id: `sync_err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('ar-EG'),
    ...failure
  };
  failureLogs.unshift(newLog);
  if (failureLogs.length > 20) {
    failureLogs.pop();
  }
  failureListeners.forEach(fn => fn([...failureLogs]));
}

export function clearSyncFailures() {
  failureLogs.length = 0;
  failureListeners.forEach(fn => fn([]));
}

// Helper to normalize keys so PC and Mobile map to the exact same field names
export function normalizeKey(rawKey: string): string {
  let key = rawKey;
  if (key.startsWith("radius_")) key = key.substring(7);
  if (key.endsWith("_secure")) key = key.substring(0, key.length - 7);
  if (key === "deleted_customers") return "deletedCustomers";
  if (key === "distributor_offers") return "distributorOffers";
  if (key === "current_user") return "currentUser";
  return key;
}

// Automatically catch ALL safeStorage.setItem calls across the entire app
setStorageChangeListener((rawKey: string, rawValue: string) => {
  const cleanKey = normalizeKey(rawKey);

  // Skip browser-local transient preferences
  const transientKeys = ["dark_mode", "remember_me", "saved_username", "saved_password", "last_role", "is_portal_mode", "logged_in_customer_id", "is_logged_in"];
  if (transientKeys.includes(cleanKey)) return;

  let payload: any = rawValue;
  if (rawValue) {
    try {
      payload = JSON.parse(rawValue);
    } catch {
      payload = rawValue;
    }
  }

  pushStateToServer({ [cleanKey]: payload });
});

// BroadcastChannel for instant same-device cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel("radius_cross_device_sync");
    broadcastChannel.onmessage = (event) => {
      // Ignore broadcast messages sent by this same tab!
      if (event.data && event.data.type === "REMOTE_SYNC" && event.data.senderId !== TAB_ID) {
        fetchRemoteState(false);
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel not supported or failed:", e);
  }
}

export function registerSyncListener(callback: SyncCallback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getClientLastSyncTime() {
  return clientLastSyncTime;
}

export function setClientLastSyncTime(ts: number) {
  clientLastSyncTime = ts;
}

// Push local changes to the server API (debounced to avoid rate limiting)
let pendingPushData: Record<string, any> = {};
let pushDebounceTimer: any = null;

export async function pushStateToServer(partialData: Record<string, any>) {
  pendingPushData = { ...pendingPushData, ...partialData };

  if (pushDebounceTimer) {
    clearTimeout(pushDebounceTimer);
  }

  return new Promise<void>((resolve) => {
    pushDebounceTimer = setTimeout(async () => {
      if (Date.now() < syncPausedUntil) {
        console.warn("[SyncManager] Push skipped due to 429 rate limit cooldown.");
        resolve();
        return;
      }

      const dataToSend = { ...pendingPushData };
      pendingPushData = {};
      pushDebounceTimer = null;

      try {
        setStatus('syncing');
        const now = Date.now();
        clientLastSyncTime = now;

        const response = await fetch(`/api/sync?_t=${now}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          },
          body: JSON.stringify({
            data: dataToSend,
            timestamp: now
          })
        });

        if (response.status === 429) {
          syncPausedUntil = Date.now() + 5000; // Brief 5s cooldown
          setStatus('disconnected');
          recordSyncFailure({
            type: 'push',
            endpoint: '/api/sync',
            statusCode: 429,
            errorMessage: 'تم تجاوز حد الطلبات مؤقتاً (Rate exceeded). انتظر 5 ثوانٍ.'
          });
          resolve();
          return;
        }

        if (response.ok) {
          const result = await response.json();
          if (result.lastUpdated) {
            clientLastSyncTime = result.lastUpdated;
          }
          setStatus('connected');
        } else {
          setStatus('disconnected');
          recordSyncFailure({
            type: 'push',
            endpoint: '/api/sync',
            statusCode: response.status,
            errorMessage: `فشل استجابة السيرفر (HTTP ${response.status}: ${response.statusText || 'Server Error'})`,
            payloadSummary: Object.keys(dataToSend).join(', ') || 'Partial Update'
          });
        }

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: "REMOTE_SYNC", timestamp: now, senderId: TAB_ID });
        }
      } catch (e: any) {
        console.warn("[SyncManager] Failed to push state to server:", e);
        setStatus('disconnected');
        recordSyncFailure({
          type: 'push',
          endpoint: '/api/sync',
          errorMessage: e?.message || 'فشل الاتصال بالشبكة أو انقطاع الإنترنت بالكامل',
          payloadSummary: Object.keys(dataToSend).join(', ') || 'Partial Update'
        });
      } finally {
        resolve();
      }
    }, 1000); // 1.0s debounce
  });
}

// Fetch full state from server if updated
export async function fetchRemoteState(force = false): Promise<Record<string, any> | null> {
  if (Date.now() < syncPausedUntil) {
    console.warn("[SyncManager] Fetch skipped due to rate limit cooldown.");
    return null;
  }

  if (isFetchingRemote) {
    return null;
  }

  const now = Date.now();
  if (!force && now - lastFetchExecutionTime < 3000) {
    return null; // Minimum 3s interval between automatic fetches
  }

  isFetchingRemote = true;
  lastFetchExecutionTime = now;

  try {
    if (!force) {
      const verRes = await fetch(`/api/sync/version?_t=${now}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });

      if (verRes.status === 429) {
        syncPausedUntil = Date.now() + 5000; // 5s cooldown
        setStatus('disconnected');
        return null;
      }

      if (verRes.ok) {
        const verData = await verRes.json();
        if (verData.lastUpdated && verData.lastUpdated <= clientLastSyncTime) {
          setStatus('connected');
          return null;
        }
      } else {
        setStatus('disconnected');
        recordSyncFailure({
          type: 'fetch',
          endpoint: '/api/sync/version',
          statusCode: verRes.status,
          errorMessage: `فشل فحص إصدار المزامنة (HTTP ${verRes.status})`
        });
        return null;
      }
    }

    setStatus('syncing');
    const res = await fetch(`/api/sync?_t=${now}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });

    if (res.status === 429) {
      syncPausedUntil = Date.now() + 5000; // 5s cooldown
      setStatus('disconnected');
      recordSyncFailure({
        type: 'fetch',
        endpoint: '/api/sync',
        statusCode: 429,
        errorMessage: 'تجاوز حد الطلبات مؤقتاً (Rate exceeded).'
      });
      return null;
    }

    if (res.ok) {
      const payload = await res.json();
      if (payload && payload.data && typeof payload.data === "object") {
        if (payload.lastUpdated) {
          clientLastSyncTime = payload.lastUpdated;
        }

        // Write received payload data to local safeStorage without triggering storageChangeListener
        setSyncingFromRemote(true);
        try {
          Object.entries(payload.data).forEach(([key, value]) => {
            if (value !== undefined) {
              let localKey = key;
              if (key === "deletedCustomers") localKey = "deleted_customers";
              if (key === "distributorOffers") localKey = "distributor_offers";
              if (key === "currentUser") localKey = "current_user";
              const storageKey = `radius_${localKey}`;
              const stringVal = typeof value === "string" ? value : JSON.stringify(value);
              safeStorage.setItem(storageKey, stringVal);
            }
          });
        } finally {
          setSyncingFromRemote(false);
        }

        // Notify App.tsx listeners ONCE with the entire payload
        listeners.forEach((fn) => fn(payload.data));

        setStatus('connected');
        return payload.data;
      }
      setStatus('connected');
    } else {
      setStatus('disconnected');
      recordSyncFailure({
        type: 'fetch',
        endpoint: '/api/sync',
        statusCode: res.status,
        errorMessage: `فشل جلب أحدث الحزم السحابية (HTTP ${res.status})`
      });
    }
  } catch (e: any) {
    console.warn("[SyncManager] Failed to fetch remote state:", e);
    setStatus('disconnected');
    recordSyncFailure({
      type: 'fetch',
      endpoint: '/api/sync',
      errorMessage: e?.message || 'تعذر الاتصال بخادم التزامن اللحظي'
    });
  } finally {
    isFetchingRemote = false;
  }
  return null;
}

export function syncPersistentStorage(key: string, value: string, _customServerPayload?: any) {
  // safeStorage.setItem already triggers storageChangeListener & pushStateToServer
  safeStorage.setItem(key, value);
}
