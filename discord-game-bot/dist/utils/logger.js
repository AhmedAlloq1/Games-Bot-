"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.configureLogger = configureLogger;
const levels = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
let configuredLevel = "info";
function configureLogger(level) {
    if (level in levels)
        configuredLevel = level;
}
function write(level, message, details) {
    if (levels[level] < levels[configuredLevel])
        return;
    const suffix = details === undefined ? "" : ` ${JSON.stringify(details)}`;
    const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${suffix}`;
    if (level === "error")
        console.error(line);
    else if (level === "warn")
        console.warn(line);
    else
        console.log(line);
}
exports.logger = {
    debug: (message, details) => write("debug", message, details),
    info: (message, details) => write("info", message, details),
    warn: (message, details) => write("warn", message, details),
    error: (message, details) => write("error", message, details),
};
