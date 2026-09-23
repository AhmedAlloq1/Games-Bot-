"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceCommand = void 0;
const discord_js_1 = require("discord.js");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const embeds_1 = require("../utils/embeds");
exports.balanceCommand = {
    data: new discord_js_1.SlashCommandBuilder().setName("balance").setDescription("عرض رصيدك الحالي"),
    async execute(interaction, context) {
        const result = await (0, interaction_1.getPlayerContext)(interaction, context);
        if (!result)
            return;
        await interaction.reply({
            embeds: [(0, embeds_1.gameEmbed)("رصيدك", `لديك **${(0, format_1.formatCoins)(result.player.balance)}**.`, embeds_1.colors.success)],
        });
    },
};
