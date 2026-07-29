import { safeStorage } from "./storage";

export const logAction = (user: string, target: string, action: string, distId?: string) => {
  const currentLogsStr = safeStorage.getItem("radius_logs");
  const currentLogs = currentLogsStr ? JSON.parse(currentLogsStr) : [];
  const newLog = {
    id: `log_${Date.now()}`,
    date: new Date().toISOString(),
    user,
    action: target,
    details: action,
    status: "success",
    ipAddress: "127.0.0.1"
  };
  const updatedLogs = [newLog, ...currentLogs];
  safeStorage.setItem("radius_logs", JSON.stringify(updatedLogs));
  return updatedLogs;
};
