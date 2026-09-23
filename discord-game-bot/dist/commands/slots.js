"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotsCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
const symbols = ["7", "BAR", "bell", "cherry", "lemon"];
exports.slotsCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("slots")
        .setDescription("شغّل ماكينة الحظ")
        .addIntegerOption((option) => option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true)),
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
        const reels = [(0, random_1.pick)(symbols), (0, random_1.pick)(symbols), (0, random_1.pick)(symbols)];
        const jackpot = reels[0] === reels[1] && reels[1] === reels[2];
        const pair = !jackpot && (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]);
        const win = jackpot || pair;
        const payout = jackpot ? bet.amount * 10 : pair ? bet.amount * 2 : bet.amount;
        const recorded = await context.database.recordGame({
            guildId: result.guildId,
            userId: interaction.user.id,
            username: interaction.user.username,
            game: "slots",
            result: win ? "win" : "loss",
            amount: payout,
        });
        const message = `\`${reels.join(" | ")}\`\n\n${jackpot ? `Jackpot! ربحت ${(0, format_1.formatCoins)(payout)}.` : pair ? `زوج متطابق! ربحت ${(0, format_1.formatCoins)(payout)}.` : `لا تطابق. خسرت ${(0, format_1.formatCoins)(bet.amount)}.`}\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`;
        await interaction.reply({ embeds: [(0, embeds_1.gameEmbed)("Slots", message, win ? embeds_1.colors.success : embeds_1.colors.danger)] });
    },
};
