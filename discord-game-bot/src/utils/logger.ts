type LogLevel = "debug" | "info" | "warn" | "error";

const levels: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

let configuredLevel: LogLevel = "info";

export function configureLogger(level: string): void {
  if (level in levels) configuredLevel = level as LogLevel;
}

function write(level: LogLevel, message: string, details?: unknown): void {
  if (levels[level] < levels[configuredLevel]) return;
  const suffix = details === undefined ? "" : ` ${JSON.stringify(details)}`;
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${suffix}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, details?: unknown) => write("debug", message, details),
  info: (message: string, details?: unknown) => write("info", message, details),
  warn: (message: string, details?: unknown) => write("warn", message, details),
  error: (message: string, details?: unknown) => write("error", message, details),
};