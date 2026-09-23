"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinflipCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
exports.coinflipCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("راهن على نتيجة رمي العملة")
        .addIntegerOption((option) => option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true))
        .addStringOption((option) => option
        .setName("choice")
        .setDescription("اختيارك")
        .setRequired(true)
        .addChoices({ name: "صورة", value: "heads" }, { name: "كتابة", value: "tails" })),
    game: true,
    async execute(interaction, context) {
        if (!(await (0, interaction_1.requireGameChannel)(interaction, context)))
            return;
        const result = await (0, interaction_1.getPlayerContext)(interaction, context);
        if (!result)
            return;
        const bet = (0, interaction_1.parseBet)(interaction, result.player.balance);
        if (bet.error) {
            await interaction.reply({ content: bet.error, ephemeral: true });
            return;
        }
        const choice = interaction.options.getString("choice", true);
        const outcome = (0, random_1.pick)(["heads", "tails"]);
        const win = choice === outcome;
        const recorded = await context.database.recordGame({
            guildId: result.guildId,
            userId: interaction.user.id,
            username: interaction.user.username,
            game: "coinflip",
            result: win ? "win" : "loss",
            amount: bet.amount,
        });
        const label = outcome === "heads" ? "صورة" : "كتابة";
        const description = win
            ? `ظهرت **${label}** — فزت بـ **${(0, format_1.formatCoins)(bet.amount)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`
            : `ظهرت **${label}** — خسرت **${(0, format_1.formatCoins)(bet.amount)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`;
        await interaction.reply({ embeds: [(0, embeds_1.gameEmbed)("رمي العملة", description, win ? embeds_1.colors.success : embeds_1.colors.danger)] });
    },
};
