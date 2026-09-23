"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDatabase = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const gameNames = [
    "coinflip",
    "dice",
    "rps",
    "guess",
    "trivia",
    "blackjack",
    "slots",
    "duel",
];
function emptyStats() {
    const byGame = {};
    for (const game of gameNames)
        byGame[game] = { played: 0, wins: 0, losses: 0 };
    return { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, wagered: 0, won: 0, lost: 0, byGame };
}
function now() {
    return new Date().toISOString();
}
class JsonDatabase {
    config;
    data = { version: 1, updatedAt: now(), players: {}, events: [] };
    writeQueue = Promise.resolve();
    constructor(config) {
        this.config = config;
    }
    async init() {
        await promises_1.default.mkdir(node_path_1.default.dirname(this.config.databasePath), { recursive: true });
        try {
            const raw = await promises_1.default.readFile(this.config.databasePath, "utf8");
            const parsed = JSON.parse(raw);
            this.data = {
                version: 1,
                updatedAt: parsed.updatedAt || now(),
                players: parsed.players || {},
                events: Array.isArray(parsed.events) ? parsed.events : [],
            };
        }
        catch (error) {
            const fileError = error;
            if (fileError.code !== "ENOENT")
                throw error;
            await this.persist();
        }
    }
    key(guildId, userId) {
        return `${guildId}:${userId}`;
    }
    async persist() {
        this.data.updatedAt = now();
        const payload = JSON.stringify(this.data, null, 2);
        this.writeQueue = this.writeQueue.then(async () => {
            const temporaryPath = `${this.config.databasePath}.tmp`;
            await promises_1.default.writeFile(temporaryPath, payload, "utf8");
            await promises_1.default.rename(temporaryPath, this.config.databasePath);
        });
        await this.writeQueue;
    }
    ensurePlayer(guildId, userId, username) {
        const key = this.key(guildId, userId);
        const existing = this.data.players[key];
        if (existing) {
            if (existing.username !== username)
                existing.username = username;
            return existing;
        }
        const timestamp = now();
        const player = {
            guildId,
            userId,
            username,
            balance: this.config.startingBalance,
            createdAt: timestamp,
            updatedAt: timestamp,
            stats: emptyStats(),
        };
        this.data.players[key] = player;
        return player;
    }
    async getPlayer(guildId, userId, username) {
        const player = this.ensurePlayer(guildId, userId, username);
        await this.persist();
        return structuredClone(player);
    }
    async changeBalance(guildId, userId, username, amount) {
        const player = this.ensurePlayer(guildId, userId, username);
        const nextBalance = player.balance + amount;
        if (nextBalance < 0)
            throw new Error("INSUFFICIENT_BALANCE");
        player.balance = nextBalance;
        player.updatedAt = now();
        await this.persist();
        return structuredClone(player);
    }
    async claimDaily(guildId, userId, username) {
        const player = this.ensurePlayer(guildId, userId, username);
        const cooldown = 24 * 60 * 60 * 1000;
        const lastClaim = player.lastDailyAt ? Date.parse(player.lastDailyAt) : 0;
        const nextClaimAt = new Date(lastClaim + cooldown).toISOString();
        if (lastClaim && Date.now() - lastClaim < cooldown) {
            return { claimed: false, reward: 0, nextClaimAt, player: structuredClone(player) };
        }
        player.lastDailyAt = now();
        player.balance += this.config.dailyReward;
        player.updatedAt = now();
        await this.persist();
        return {
            claimed: true,
            reward: this.config.dailyReward,
            nextClaimAt: new Date(Date.now() + cooldown).toISOString(),
            player: structuredClone(player),
        };
    }
    async recordGame(input) {
        const player = this.ensurePlayer(input.guildId, input.userId, input.username);
        const payout = input.result === "win" ? input.amount : input.result === "loss" ? -input.amount : 0;
        if (player.balance + payout < 0)
            throw new Error("INSUFFICIENT_BALANCE");
        player.balance += payout;
        player.updatedAt = now();
        player.stats.gamesPlayed += 1;
        player.stats.wagered += input.amount;
        if (input.result === "win") {
            player.stats.wins += 1;
            player.stats.won += input.amount;
        }
        else if (input.result === "loss") {
            player.stats.losses += 1;
            player.stats.lost += input.amount;
        }
        else {
            player.stats.draws += 1;
        }
        const gameStats = player.stats.byGame[input.game];
        gameStats.played += 1;
        if (input.result === "win")
            gameStats.wins += 1;
        if (input.result === "loss")
            gameStats.losses += 1;
        const event = {
            id: (0, node_crypto_1.randomUUID)(),
            guildId: input.guildId,
            userId: input.userId,
            game: input.game,
            result: input.result,
            amount: input.amount,
            balanceAfter: player.balance,
            createdAt: now(),
            opponentId: input.opponentId,
        };
        this.data.events.unshift(event);
        this.data.events = this.data.events.slice(0, 2000);
        await this.persist();
        return { player: structuredClone(player), event };
    }
    async recordDuel(input) {
        const winner = this.ensurePlayer(input.guildId, input.winnerId, input.winnerName);
        const loser = this.ensurePlayer(input.guildId, input.loserId, input.loserName);
        if (loser.balance < input.amount)
            throw new Error("OPPONENT_INSUFFICIENT_BALANCE");
        loser.balance -= input.amount;
        winner.balance += input.amount;
        const timestamp = now();
        winner.updatedAt = timestamp;
        loser.updatedAt = timestamp;
        this.applyStats(winner, "duel", "win", input.amount);
        this.applyStats(loser, "duel", "loss", input.amount);
        this.data.events.unshift({
            id: (0, node_crypto_1.randomUUID)(),
            guildId: input.guildId,
            userId: winner.userId,
            game: "duel",
            result: "win",
            amount: input.amount,
            balanceAfter: winner.balance,
            createdAt: timestamp,
            opponentId: loser.userId,
        }, {
            id: (0, node_crypto_1.randomUUID)(),
            guildId: input.guildId,
            userId: loser.userId,
            game: "duel",
            result: "loss",
            amount: input.amount,
            balanceAfter: loser.balance,
            createdAt: timestamp,
            opponentId: winner.userId,
        });
        this.data.events = this.data.events.slice(0, 2000);
        await this.persist();
        return { winner: structuredClone(winner), loser: structuredClone(loser) };
    }
    applyStats(player, game, result, amount) {
        player.stats.gamesPlayed += 1;
        player.stats.wagered += amount;
        const gameStats = player.stats.byGame[game];
        gameStats.played += 1;
        if (result === "win") {
            player.stats.wins += 1;
            player.stats.won += amount;
            gameStats.wins += 1;
        }
        else {
            player.stats.losses += 1;
            player.stats.lost += amount;
            gameStats.losses += 1;
        }
    }
    async leaderboard(guildId, limit = 10) {
        return Object.values(this.data.players)
            .filter((player) => player.guildId === guildId)
            .sort((a, b) => b.balance - a.balance)
            .slice(0, limit)
            .map((player) => structuredClone(player));
    }
    async recentEvents(guildId, limit = 10) {
        return this.data.events.filter((event) => event.guildId === guildId).slice(0, limit).map((event) => structuredClone(event));
    }
}
exports.JsonDatabase = JsonDatabase;
