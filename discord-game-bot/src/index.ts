import { Client, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./config/env";
import { JsonDatabase } from "./database/jsonDatabase";
import { registerEvents } from "./events";
import { configureLogger, logger } from "./utils/logger";

async function main(): Promise<void> {
  const config = loadConfig();
  configureLogger(config.logLevel);
  const database = new JsonDatabase(config);
  await database.init();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  registerEvents(client, { config, database });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}; shutting down.`);
    client.destroy();
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => logger.error("Unhandled promise rejection", { reason }));
  process.on("uncaughtException", (error) => logger.error("Uncaught exception", { error: error.message }));

  await client.login(config.token);
}

void main().catch((error) => {
  logger.error("Bot failed to start", { error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
});