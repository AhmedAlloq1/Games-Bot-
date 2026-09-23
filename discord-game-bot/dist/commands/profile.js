"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileCommand = void 0;
const discord_js_1 = require("discord.js");
const format_1 = require("../utils/format");
const embeds_1 = require("../utils/embeds");
exports.profileCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("profile")
        .setDescription("عرض ملفك وإحصائياتك")
        .addUserOption((option) => option.setName("user").setDescription("لاعب آخر اختياريًا")),
    async execute(interaction, context) {
        const guildId = await (async () => {
            if (interaction.guildId)
                return interaction.guildId;
            await interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
            return null;
        })();
        if (!guildId)
            return;
        const user = interaction.options.getUser("user") || interaction.user;
        const player = await context.database.getPlayer(guildId, user.id, user.username);
        const winRate = player.stats.gamesPlayed
            ? Math.round((player.stats.wins / player.stats.gamesPlayed) * 100)
            : 0;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(embeds_1.colors.primary)
            .setAuthor({ name: user.globalName || user.username, iconURL: user.displayAvatarURL() })
            .setTitle("ملف اللاعب")
            .addFields({ name: "الرصيد", value: (0, format_1.formatCoins)(player.balance), inline: true }, { name: "الألعاب", value: `${player.stats.gamesPlayed}`, inline: true }, { name: "نسبة الفوز", value: `${winRate}%`, inline: true }, { name: "الانتصارات", value: `${player.stats.wins}`, inline: true }, { name: "الخسائر", value: `${player.stats.losses}`, inline: true }, { name: "إجمالي الرهانات", value: (0, format_1.formatCoins)(player.stats.wagered), inline: true })
            .setFooter({ text: "الإحصائيات مستقلة لكل سيرفر." });
        await interaction.reply({ embeds: [embed] });
    },
};
