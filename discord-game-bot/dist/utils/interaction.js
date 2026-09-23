"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireGuild = requireGuild;
exports.requireGameChannel = requireGameChannel;
exports.getPlayerContext = getPlayerContext;
exports.parseBet = parseBet;
exports.sendError = sendError;
const format_1 = require("./format");
async function requireGuild(interaction) {
    if (interaction.guildId)
        return interaction.guildId;
    await interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
    return null;
}
async function requireGameChannel(interaction, context) {
    if (interaction.channelId === context.config.gameChannelId)
        return true;
    const channelMention = `<#${context.config.gameChannelId}>`;
    const content = `استخدم ألعاب البوت داخل قناة الألعاب ${channelMention} فقط.`;
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, ephemeral: true });
    }
    else {
        await interaction.reply({ content, ephemeral: true });
    }
    return false;
}
async function getPlayerContext(interaction, context) {
    const guildId = await requireGuild(interaction);
    if (!guildId)
        return null;
    const player = await context.database.getPlayer(guildId, interaction.user.id, interaction.user.username);
    return { guildId, player };
}
function parseBet(interaction, balance) {
    const amount = interaction.options.getInteger("bet", true);
    if (!Number.isInteger(amount) || amount < 1)
        return { amount, error: "قيمة الرهان يجب أن تكون رقمًا صحيحًا أكبر من صفر." };
    if (amount > balance)
        return { amount, error: `رصيدك الحالي ${(0, format_1.formatCoins)(balance)} ولا يكفي لهذا الرهان.` };
    return { amount };
}
async function sendError(interaction, message) {
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true });
    }
    else {
        await interaction.reply({ content: message, ephemeral: true });
    }
}
