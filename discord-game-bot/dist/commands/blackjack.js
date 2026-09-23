"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blackjackCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
function drawCard() {
    return (0, random_1.randomInt)(1, 11);
}
function handValue(hand) {
    let total = hand.reduce((sum, card) => sum + card, 0);
    let aces = hand.filter((card) => card === 1).length;
    while (aces > 0 && total + 10 <= 21) {
        total += 10;
        aces -= 1;
    }
    return total;
}
exports.blackjackCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("العب جولة بلاك جاك سريعة")
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
        const playerHand = [drawCard(), drawCard()];
        const dealerHand = [drawCard(), drawCard()];
        let playerTotal = handValue(playerHand);
        let dealerTotal = handValue(dealerHand);
        while (playerTotal < 17 && playerTotal <= 21) {
            playerHand.push(drawCard());
            playerTotal = handValue(playerHand);
        }
        while (dealerTotal < 17 && dealerTotal <= 21) {
            dealerHand.push(drawCard());
            dealerTotal = handValue(dealerHand);
        }
        const playerBlackjack = playerHand.length === 2 && playerTotal === 21;
        const dealerBlackjack = dealerHand.length === 2 && dealerTotal === 21;
        const win = playerTotal <= 21 && (dealerTotal > 21 || playerTotal > dealerTotal || playerBlackjack);
        const draw = playerTotal <= 21 && playerTotal === dealerTotal && !playerBlackjack && !dealerBlackjack;
        const gameResult = draw ? "draw" : win ? "win" : "loss";
        const payout = win ? (playerBlackjack ? bet.amount * 3 : bet.amount * 2) : bet.amount;
        const recorded = await context.database.recordGame({
            guildId: result.guildId,
            userId: interaction.user.id,
            username: interaction.user.username,
            game: "blackjack",
            result: gameResult,
            amount: payout,
        });
        const message = `يدك: **${playerHand.join(", ")}** = ${playerTotal}\nيد الموزع: **${dealerHand.join(", ")}** = ${dealerTotal}\n\n${win ? `فوز! ربحت ${(0, format_1.formatCoins)(payout)}.` : draw ? "تعادل، لم يتغير رصيدك." : `خسرت ${(0, format_1.formatCoins)(bet.amount)}.`}\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`;
        await interaction.reply({ embeds: [(0, embeds_1.gameEmbed)("Blackjack", message, win ? embeds_1.colors.success : draw ? embeds_1.colors.warning : embeds_1.colors.danger)] });
    },
};
