export function formatCoins(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} coins`;
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${Math.max(0, minutes)}m`;
}

export function displayName(name: string): string {
  return name.length > 28 ? `${name.slice(0, 25)}...` : name;
}