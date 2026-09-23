"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const env_1 = require("./config/env");
const jsonDatabase_1 = require("./database/jsonDatabase");
const events_1 = require("./events");
const logger_1 = require("./utils/logger");
async function main() {
    const config = (0, env_1.loadConfig)();
    (0, logger_1.configureLogger)(config.logLevel);
    const database = new jsonDatabase_1.JsonDatabase(config);
    await database.init();
    const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
    (0, events_1.registerEvents)(client, { config, database });
    const shutdown = async (signal) => {
        logger_1.logger.info(`Received ${signal}; shutting down.`);
        client.destroy();
        process.exit(0);
    };
    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("unhandledRejection", (reason) => logger_1.logger.error("Unhandled promise rejection", { reason }));
    process.on("uncaughtException", (error) => logger_1.logger.error("Uncaught exception", { error: error.message }));
    await client.login(config.token);
}
void main().catch((error) => {
    logger_1.logger.error("Bot failed to start", { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
});
