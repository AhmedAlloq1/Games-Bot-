"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpCommand = void 0;
const discord_js_1 = require("discord.js");
const interaction_1 = require("../utils/interaction");
const embeds_1 = require("../utils/embeds");
exports.helpCommand = {
    data: new discord_js_1.SlashCommandBuilder().setName("help").setDescription("عرض جميع أوامر البوت"),
    async execute(interaction) {
        if (!(await (0, interaction_1.requireGuild)(interaction)))
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(embeds_1.colors.primary)
            .setTitle("أوامر ZN-MAZEN")
            .setDescription("استخدم الألعاب داخل قناة الألعاب المحددة في `GAME_CHANNEL_ID`.")
            .addFields({ name: "الحساب والاقتصاد", value: "`/profile` `/balance` `/daily` `/leaderboard`", inline: false }, { name: "الألعاب الفردية", value: "`/coinflip` `/dice` `/rps` `/guess` `/trivia` `/blackjack` `/slots`", inline: false }, { name: "اللعب ضد لاعب", value: "`/duel` — تحدَّ لاعبًا آخر برهان متساوٍ", inline: false })
            .setFooter({ text: "كل سيرفر يملك اقتصادًا وترتيبًا مستقلًا." });
        await interaction.reply({ embeds: [embed] });
    },
};
