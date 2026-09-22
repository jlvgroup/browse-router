import { createMMKV } from 'react-native-mmkv';

const logStorage = createMMKV({ id: 'browse-router-logs' });
const MAX_LOGS = 200;

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  ts: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export function appendLog(entry: Omit<LogEntry, 'ts'>): void {
  const logs = readLogs();
  logs.unshift({ ...entry, ts: Date.now() });
  logStorage.set('logs', JSON.stringify(logs.slice(0, MAX_LOGS)));
}

export function readLogs(): LogEntry[] {
  const raw = logStorage.getString('logs');
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

export function clearLogs(): void {
  logStorage.remove('logs');
}
