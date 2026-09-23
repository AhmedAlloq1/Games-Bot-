"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCoins = formatCoins;
exports.formatDuration = formatDuration;
exports.displayName = displayName;
function formatCoins(value) {
    return `${Math.round(value).toLocaleString("en-US")} coins`;
}
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h`;
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    return `${Math.max(0, minutes)}m`;
}
function displayName(name) {
    return name.length > 28 ? `${name.slice(0, 25)}...` : name;
}
