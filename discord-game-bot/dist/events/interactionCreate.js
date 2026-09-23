"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInteractionEvent = registerInteractionEvent;
const commands_1 = require("../commands");
const logger_1 = require("../utils/logger");
const interaction_1 = require("../utils/interaction");
function registerInteractionEvent(client, context) {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand())
            return;
        const command = commands_1.commandMap.get(interaction.commandName);
        if (!command) {
            await (0, interaction_1.sendError)(interaction, "هذا الأمر غير متاح حاليًا. أعد تسجيل الأوامر باستخدام `pnpm run deploy`.");
            return;
        }
        try {
            await command.execute(interaction, context);
            logger_1.logger.debug(`Command executed: /${interaction.commandName}`, {
                guildId: interaction.guildId,
                userId: interaction.user.id,
            });
        }
        catch (error) {
            logger_1.logger.error(`Command failed: /${interaction.commandName}`, {
                guildId: interaction.guildId,
                userId: interaction.user.id,
                error: error instanceof Error ? error.message : String(error),
            });
            await (0, interaction_1.sendError)(interaction, "حدث خطأ غير متوقع أثناء تنفيذ الأمر. حاول مرة أخرى.");
        }
    });
}
