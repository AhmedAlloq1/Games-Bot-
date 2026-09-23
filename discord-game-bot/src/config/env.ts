import "dotenv/config";
import path from "node:path";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}

export type BotConfig = {
  token: string;
  clientId: string;
  guildId?: string;
  gameChannelId: string;
  databasePath: string;
  startingBalance: number;
  dailyReward: number;
  logLevel: string;
};

export function loadConfig(): BotConfig {
  const databasePath = process.env.DATABASE_PATH?.trim() || "./data/database.json";
  return {
    token: required("DISCORD_TOKEN"),
    clientId: required("CLIENT_ID"),
    guildId: process.env.GUILD_ID?.trim() || undefined,
    gameChannelId: required("GAME_CHANNEL_ID"),
    databasePath: path.resolve(process.cwd(), databasePath),
    startingBalance: positiveInteger("STARTING_BALANCE", 1000),
    dailyReward: positiveInteger("DAILY_REWARD", 250),
    logLevel: process.env.LOG_LEVEL?.trim() || "info",
  };
}