import type { ChatInputCommandInteraction } from "discord.js";
import type { CommandContext } from "../types/command";
import type { JsonDatabase } from "../database/jsonDatabase";
import { formatCoins } from "./format";

export async function requireGuild(
  interaction: ChatInputCommandInteraction,
): Promise<string | null> {
  if (interaction.guildId) return interaction.guildId;
  await interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
  return null;
}

export async function requireGameChannel(
  interaction: ChatInputCommandInteraction,
  context: CommandContext,
): Promise<boolean> {
  if (interaction.channelId === context.config.gameChannelId) return true;
  const channelMention = `<#${context.config.gameChannelId}>`;
  const content = `استخدم ألعاب البوت داخل قناة الألعاب ${channelMention} فقط.`;
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content, ephemeral: true });
  } else {
    await interaction.reply({ content, ephemeral: true });
  }
  return false;
}

export async function getPlayerContext(
  interaction: ChatInputCommandInteraction,
  context: CommandContext,
): Promise<{ guildId: string; player: Awaited<ReturnType<JsonDatabase["getPlayer"]>> } | null> {
  const guildId = await requireGuild(interaction);
  if (!guildId) return null;
  const player = await context.database.getPlayer(guildId, interaction.user.id, interaction.user.username);
  return { guildId, player };
}

export function parseBet(
  interaction: ChatInputCommandInteraction,
  balance: number,
): { amount: number; error?: string } {
  const amount = interaction.options.getInteger("bet", true);
  if (!Number.isInteger(amount) || amount < 1) return { amount, error: "قيمة الرهان يجب أن تكون رقمًا صحيحًا أكبر من صفر." };
  if (amount > balance) return { amount, error: `رصيدك الحالي ${formatCoins(balance)} ولا يكفي لهذا الرهان.` };
  return { amount };
}

export async function sendError(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content: message, ephemeral: true });
  } else {
    await interaction.reply({ content: message, ephemeral: true });
  }
}