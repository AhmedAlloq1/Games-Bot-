"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
require("dotenv/config");
const node_path_1 = __importDefault(require("node:path"));
function required(name) {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function positiveInteger(name, fallback) {
    const raw = process.env[name]?.trim();
    if (!raw)
        return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${name} must be a non-negative integer`);
    }
    return value;
}
function loadConfig() {
    const databasePath = process.env.DATABASE_PATH?.trim() || "./data/database.json";
    return {
        token: required("DISCORD_TOKEN"),
        clientId: required("CLIENT_ID"),
        guildId: process.env.GUILD_ID?.trim() || undefined,
        gameChannelId: required("GAME_CHANNEL_ID"),
        databasePath: node_path_1.default.resolve(process.cwd(), databasePath),
        startingBalance: positiveInteger("STARTING_BALANCE", 1000),
        dailyReward: positiveInteger("DAILY_REWARD", 250),
        logLevel: process.env.LOG_LEVEL?.trim() || "info",
    };
}
