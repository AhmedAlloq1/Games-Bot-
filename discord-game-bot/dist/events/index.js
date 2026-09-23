"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvents = registerEvents;
const logger_1 = require("../utils/logger");
const interactionCreate_1 = require("./interactionCreate");
const ready_1 = require("./ready");
function registerEvents(client, context) {
    (0, ready_1.registerReadyEvent)(client);
    (0, interactionCreate_1.registerInteractionEvent)(client, context);
    client.on("guildCreate", (guild) => {
        logger_1.logger.info(`Joined guild: ${guild.name}`, { guildId: guild.id });
    });
    client.on("guildDelete", (guild) => {
        logger_1.logger.info(`Left guild: ${guild.name}`, { guildId: guild.id });
    });
    client.on("error", (error) => logger_1.logger.error("Discord client error", { error: error.message }));
    client.on("warn", (message) => logger_1.logger.warn("Discord client warning", { message }));
}
