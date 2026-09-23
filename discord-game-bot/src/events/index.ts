import type { Client } from "discord.js";
import type { CommandContext } from "../types/command";
import { logger } from "../utils/logger";
import { registerInteractionEvent } from "./interactionCreate";
import { registerReadyEvent } from "./ready";

export function registerEvents(client: Client, context: CommandContext): void {
  registerReadyEvent(client);
  registerInteractionEvent(client, context);
  client.on("guildCreate", (guild) => {
    logger.info(`Joined guild: ${guild.name}`, { guildId: guild.id });
  });
  client.on("guildDelete", (guild) => {
    logger.info(`Left guild: ${guild.name}`, { guildId: guild.id });
  });
  client.on("error", (error) => logger.error("Discord client error", { error: error.message }));
  client.on("warn", (message) => logger.warn("Discord client warning", { message }));
}