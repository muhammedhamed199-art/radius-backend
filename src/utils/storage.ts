class MemoryStorage {
  private data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) || null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
  get length() { return this.data.size; }
  key(index: number) { return Array.from(this.data.keys())[index] || null; }
}

let baseStorage: Storage;
try {
  window.localStorage.getItem('test');
  baseStorage = window.localStorage;
} catch (e) {
  baseStorage = new MemoryStorage() as unknown as Storage;
}

let syncingFromRemote = false;

export function setSyncingFromRemote(flag: boolean) {
  syncingFromRemote = flag;
}

export function isSyncingFromRemote(): boolean {
  return syncingFromRemote;
}

type StorageChangeListener = (key: string, value: string) => void;
let storageChangeListener: StorageChangeListener | null = null;

export function setStorageChangeListener(fn: StorageChangeListener | null) {
  storageChangeListener = fn;
}

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return baseStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      baseStorage.setItem(key, String(value));
    } catch (e) {
      console.warn("Storage setItem error:", e);
    }
    if (!syncingFromRemote && storageChangeListener) {
      try {
        storageChangeListener(key, String(value));
      } catch (e) {
        console.warn("Storage listener error:", e);
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      baseStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage removeItem error:", e);
    }
    if (!syncingFromRemote && storageChangeListener) {
      try {
        storageChangeListener(key, "");
      } catch (e) {
        console.warn("Storage listener error:", e);
      }
    }
  },
  clear: (): void => {
    try {
      baseStorage.clear();
    } catch (e) {
      console.warn("Storage clear error:", e);
    }
  },
  get length(): number {
    try {
      return baseStorage.length;
    } catch {
      return 0;
    }
  },
  key: (index: number): string | null => {
    try {
      return baseStorage.key(index);
    } catch {
      return null;
    }
  }
};

