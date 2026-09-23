import type { Client } from "discord.js";
import { logger } from "../utils/logger";

export function registerReadyEvent(client: Client): void {
  client.once("ready", (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`, {
      guilds: readyClient.guilds.cache.size,
      commands: readyClient.application.commands.cache.size,
    });
    readyClient.user.setActivity("/help | ألعاب واربح coins", { type: 0 });
  });
}