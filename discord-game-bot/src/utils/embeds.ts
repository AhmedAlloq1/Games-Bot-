import { EmbedBuilder } from "discord.js";

export const colors = {
  primary: 0x5865f2,
  success: 0x57f287,
  danger: 0xed4245,
  warning: 0xfee75c,
  neutral: 0x2f3136,
};

export function gameEmbed(title: string, description: string, color = colors.primary): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();
}