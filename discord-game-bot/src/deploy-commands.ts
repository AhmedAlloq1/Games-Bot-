import { REST, Routes } from "discord.js";
import { loadConfig } from "./config/env";
import { commands } from "./commands";

export async function deployCommands(): Promise<void> {
  const config = loadConfig();
  const rest = new REST({ version: "10" }).setToken(config.token);
  const body = commands.map((command) => command.data.toJSON());
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);
  await rest.put(route, { body });
  const scope = config.guildId ? `guild ${config.guildId}` : "all guilds";
  console.log(`Registered ${body.length} slash commands for ${scope}.`);
}

void deployCommands().catch((error) => {
  console.error("Failed to register slash commands:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});