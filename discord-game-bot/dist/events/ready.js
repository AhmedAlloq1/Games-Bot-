"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerReadyEvent = registerReadyEvent;
const logger_1 = require("../utils/logger");
function registerReadyEvent(client) {
    client.once("ready", (readyClient) => {
        logger_1.logger.info(`Logged in as ${readyClient.user.tag}`, {
            guilds: readyClient.guilds.cache.size,
            commands: readyClient.application.commands.cache.size,
        });
        readyClient.user.setActivity("/help | ألعاب واربح coins", { type: 0 });
    });
}
