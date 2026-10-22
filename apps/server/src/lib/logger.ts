interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

function log(entry: LogEntry): void {
  console.log(JSON.stringify(entry));
}

export function logInfo(message: string, data?: Record<string, unknown>): void {
  log({
    level: "info",
    message,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

export function logWarn(message: string, data?: Record<string, unknown>): void {
  log({
    level: "warn",
    message,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

export function logError(message: string, error?: unknown, data?: Record<string, unknown>): void {
  const errorInfo: Record<string, unknown> =
    error instanceof Error ? { name: error.name, message: error.message } : { raw: String(error) };

  // DrizzleQueryError and similar libs often put useful diagnostics in `cause`
  if (error instanceof Error && error.cause) {
    errorInfo.cause =
      error.cause instanceof Error
        ? { name: error.cause.name, message: error.cause.message }
        : String(error.cause);
  }

  log({
    level: "error",
    message,
    timestamp: new Date().toISOString(),
    error: errorInfo,
    ...data,
  });
}
