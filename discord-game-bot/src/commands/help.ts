import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { requireGuild } from "../utils/interaction";
import { colors } from "../utils/embeds";

export const helpCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("help").setDescription("عرض جميع أوامر البوت"),
  async execute(interaction) {
    if (!(await requireGuild(interaction))) return;
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle("أوامر ZN-MAZEN")
      .setDescription("استخدم الألعاب داخل قناة الألعاب المحددة في `GAME_CHANNEL_ID`.")
      .addFields(
        { name: "الحساب والاقتصاد", value: "`/profile` `/balance` `/daily` `/leaderboard`", inline: false },
        { name: "الألعاب الفردية", value: "`/coinflip` `/dice` `/rps` `/guess` `/trivia` `/blackjack` `/slots`", inline: false },
        { name: "اللعب ضد لاعب", value: "`/duel` — تحدَّ لاعبًا آخر برهان متساوٍ", inline: false },
      )
      .setFooter({ text: "كل سيرفر يملك اقتصادًا وترتيبًا مستقلًا." });
    await interaction.reply({ embeds: [embed] });
  },
};