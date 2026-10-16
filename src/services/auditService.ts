import { AuditLog } from '../types';

const LOCAL_STORAGE_AUDIT = 'bliss_yoga_audit_logs';

export function getAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_AUDIT);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function logAuditEvent(action: string, actor: string, details: string) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: 'aud-' + Date.now(),
    action,
    actor,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  localStorage.setItem(LOCAL_STORAGE_AUDIT, JSON.stringify(logs.slice(0, 200)));
}
