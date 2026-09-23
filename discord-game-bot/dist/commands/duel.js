"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duelCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
exports.duelCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("duel")
        .setDescription("تحدَّ لاعبًا آخر برهان متساوٍ")
        .addUserOption((option) => option.setName("opponent").setDescription("اللاعب الذي تتحداه").setRequired(true))
        .addIntegerOption((option) => option.setName("bet").setDescription("قيمة الرهان لكل لاعب").setMinValue(1).setRequired(true)),
    game: true,
    async execute(interaction, context) {
        if (!(await (0, interaction_1.requireGameChannel)(interaction, context)))
            return;
        const result = await (0, interaction_1.getPlayerContext)(interaction, context);
        if (!result)
            return;
        const opponent = interaction.options.getUser("opponent", true);
        if (opponent.bot || opponent.id === interaction.user.id) {
            await interaction.reply({ content: "اختر لاعبًا حقيقيًا آخر.", ephemeral: true });
            return;
        }
        const bet = (0, interaction_1.parseBet)(interaction, result.player.balance);
        if (bet.error) {
            await interaction.reply({ content: bet.error, ephemeral: true });
            return;
        }
        const opponentPlayer = await context.database.getPlayer(result.guildId, opponent.id, opponent.username);
        if (opponentPlayer.balance < bet.amount) {
            await interaction.reply({ content: `رصيد ${opponent.username} لا يكفي لهذا الرهان.`, ephemeral: true });
            return;
        }
        const winnerIsChallenger = (0, random_1.randomInt)(0, 1) === 1;
        const winner = winnerIsChallenger ? interaction.user : opponent;
        const loser = winnerIsChallenger ? opponent : interaction.user;
        const recorded = await context.database.recordDuel({
            guildId: result.guildId,
            winnerId: winner.id,
            winnerName: winner.username,
            loserId: loser.id,
            loserName: loser.username,
            amount: bet.amount,
        });
        await interaction.reply({
            embeds: [
                (0, embeds_1.gameEmbed)("مبارزة", `الفائز: <@${winner.id}>\nالخاسر: <@${loser.id}>\n\nانتقل إلى الفائز **${(0, format_1.formatCoins)(bet.amount)}** من الخاسر.\nرصيد الفائز: **${(0, format_1.formatCoins)(recorded.winner.balance)}**.\nرصيد الخاسر: **${(0, format_1.formatCoins)(recorded.loser.balance)}**.`, embeds_1.colors.success),
            ],
        });
    },
};
