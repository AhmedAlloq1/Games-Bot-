"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandMap = exports.commands = void 0;
const balance_1 = require("./balance");
const blackjack_1 = require("./blackjack");
const coinflip_1 = require("./coinflip");
const daily_1 = require("./daily");
const dice_1 = require("./dice");
const duel_1 = require("./duel");
const guess_1 = require("./guess");
const help_1 = require("./help");
const leaderboard_1 = require("./leaderboard");
const profile_1 = require("./profile");
const rps_1 = require("./rps");
const slots_1 = require("./slots");
const trivia_1 = require("./trivia");
exports.commands = [
    help_1.helpCommand,
    profile_1.profileCommand,
    balance_1.balanceCommand,
    daily_1.dailyCommand,
    leaderboard_1.leaderboardCommand,
    coinflip_1.coinflipCommand,
    dice_1.diceCommand,
    rps_1.rpsCommand,
    guess_1.guessCommand,
    trivia_1.triviaCommand,
    blackjack_1.blackjackCommand,
    slots_1.slotsCommand,
    duel_1.duelCommand,
];
exports.commandMap = new Map(exports.commands.map((command) => [command.data.name, command]));
