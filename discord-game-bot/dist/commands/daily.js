"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyCommand = void 0;
const discord_js_1 = require("discord.js");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const embeds_1 = require("../utils/embeds");
exports.dailyCommand = {
    data: new discord_js_1.SlashCommandBuilder().setName("daily").setDescription("استلام المكافأة اليومية"),
    async execute(interaction, context) {
        const result = await (0, interaction_1.getPlayerContext)(interaction, context);
        if (!result)
            return;
        const claim = await context.database.claimDaily(result.guildId, interaction.user.id, interaction.user.username);
        if (claim.claimed) {
            await interaction.reply({
                embeds: [
                    (0, embeds_1.gameEmbed)("تم استلام المكافأة", `أضيف إلى رصيدك **${(0, format_1.formatCoins)(claim.reward)}**.\nالرصيد الجديد: **${(0, format_1.formatCoins)(claim.player.balance)}**.`, embeds_1.colors.success),
                ],
            });
            return;
        }
        const remaining = Math.max(0, Date.parse(claim.nextClaimAt) - Date.now());
        await interaction.reply({
            embeds: [(0, embeds_1.gameEmbed)("المكافأة غير متاحة", `يمكنك استلامها بعد **${(0, format_1.formatDuration)(remaining)}**.`, embeds_1.colors.warning)],
        });
    },
};
