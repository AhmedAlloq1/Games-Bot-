"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
exports.guessCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("guess")
        .setDescription("خمن الرقم السري من 1 إلى 10")
        .addIntegerOption((option) => option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true))
        .addIntegerOption((option) => option.setName("number").setDescription("توقعك").setMinValue(1).setMaxValue(10).setRequired(true)),
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
        const guess = interaction.options.getInteger("number", true);
        const secret = (0, random_1.randomInt)(1, 10);
        const win = guess === secret;
        const recorded = await context.database.recordGame({
            guildId: result.guildId,
            userId: interaction.user.id,
            username: interaction.user.username,
            game: "guess",
            result: win ? "win" : "loss",
            amount: win ? bet.amount * 8 : bet.amount,
        });
        const message = win
            ? `أصبت الرقم **${secret}**! حصلت على **${(0, format_1.formatCoins)(bet.amount * 8)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`
            : `الرقم كان **${secret}**. خسرت **${(0, format_1.formatCoins)(bet.amount)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`;
        await interaction.reply({ embeds: [(0, embeds_1.gameEmbed)("خمن الرقم", message, win ? embeds_1.colors.success : embeds_1.colors.danger)] });
    },
};
