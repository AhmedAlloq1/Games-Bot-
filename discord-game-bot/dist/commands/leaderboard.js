"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardCommand = void 0;
const discord_js_1 = require("discord.js");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const embeds_1 = require("../utils/embeds");
exports.leaderboardCommand = {
    data: new discord_js_1.SlashCommandBuilder().setName("leaderboard").setDescription("عرض ترتيب أغنى اللاعبين"),
    async execute(interaction, context) {
        const guildId = await (0, interaction_1.requireGuild)(interaction);
        if (!guildId)
            return;
        const players = await context.database.leaderboard(guildId, 10);
        const lines = players.length
            ? players.map((player, index) => `${index + 1}. **${(0, format_1.displayName)(player.username)}** — ${(0, format_1.formatCoins)(player.balance)}`)
            : ["لا توجد حسابات بعد. استخدم `/daily` لبدء اللعب."];
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(embeds_1.colors.warning)
            .setTitle("ترتيب اللاعبين")
            .setDescription(lines.join("\n"))
            .setFooter({ text: "الترتيب خاص بهذا السيرفر." });
        await interaction.reply({ embeds: [embed] });
    },
};
