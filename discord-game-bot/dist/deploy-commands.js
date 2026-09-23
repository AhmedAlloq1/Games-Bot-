"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCommands = deployCommands;
const discord_js_1 = require("discord.js");
const env_1 = require("./config/env");
const commands_1 = require("./commands");
async function deployCommands() {
    const config = (0, env_1.loadConfig)();
    const rest = new discord_js_1.REST({ version: "10" }).setToken(config.token);
    const body = commands_1.commands.map((command) => command.data.toJSON());
    const route = config.guildId
        ? discord_js_1.Routes.applicationGuildCommands(config.clientId, config.guildId)
        : discord_js_1.Routes.applicationCommands(config.clientId);
    await rest.put(route, { body });
    const scope = config.guildId ? `guild ${config.guildId}` : "all guilds";
    console.log(`Registered ${body.length} slash commands for ${scope}.`);
}
void deployCommands().catch((error) => {
    console.error("Failed to register slash commands:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
