"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;
exports.gameEmbed = gameEmbed;
const discord_js_1 = require("discord.js");
exports.colors = {
    primary: 0x5865f2,
    success: 0x57f287,
    danger: 0xed4245,
    warning: 0xfee75c,
    neutral: 0x2f3136,
};
function gameEmbed(title, description, color = exports.colors.primary) {
    return new discord_js_1.EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();
}
