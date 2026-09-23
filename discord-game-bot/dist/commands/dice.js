"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diceCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
exports.diceCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("dice")
        .setDescription("توقع رقم النرد من 1 إلى 6")
        .addIntegerOption((option) => option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true))
        .addIntegerOption((option) => option.setName("guess").setDescription("توقعك").setMinValue(1).setMaxValue(6).setRequired(true)),
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
        const guess = interaction.options.getInteger("guess", true);
        const roll = (0, random_1.randomInt)(1, 6);
        const win = guess === roll;
        const recorded = await context.database.recordGame({
            guildId: result.guildId,
            userId: interaction.user.id,
            username: interaction.user.username,
            game: "dice",
            result: win ? "win" : "loss",
            amount: win ? bet.amount * 4 : bet.amount,
        });
        const text = win
            ? `توقعك صحيح! ظهر **${roll}** وفزت بـ **${(0, format_1.formatCoins)(bet.amount * 4)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`
            : `ظهر **${roll}** بينما توقعت ${guess}. خسرت **${(0, format_1.formatCoins)(bet.amount)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`;
        await interaction.reply({ embeds: [(0, embeds_1.gameEmbed)("النرد", text, win ? embeds_1.colors.success : embeds_1.colors.danger)] });
    },
};
