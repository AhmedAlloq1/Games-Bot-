import type { Client } from "discord.js";
import { commandMap } from "../commands";
import type { CommandContext } from "../types/command";
import { logger } from "../utils/logger";
import { sendError } from "../utils/interaction";

export function registerInteractionEvent(client: Client, context: CommandContext): void {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commandMap.get(interaction.commandName);
    if (!command) {
      await sendError(interaction, "هذا الأمر غير متاح حاليًا. أعد تسجيل الأوامر باستخدام `pnpm run deploy`.");
      return;
    }
    try {
      await command.execute(interaction, context);
      logger.debug(`Command executed: /${interaction.commandName}`, {
        guildId: interaction.guildId,
        userId: interaction.user.id,
      });
    } catch (error) {
      logger.error(`Command failed: /${interaction.commandName}`, {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        error: error instanceof Error ? error.message : String(error),
      });
      await sendError(interaction, "حدث خطأ غير متوقع أثناء تنفيذ الأمر. حاول مرة أخرى.");
    }
  });
}