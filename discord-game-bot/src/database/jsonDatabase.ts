import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { BotConfig } from "../config/env";
import type { DatabaseFile, GameEvent, GameName, PlayerRecord, PlayerStats } from "../types/database";

const gameNames: GameName[] = [
  "coinflip",
  "dice",
  "rps",
  "guess",
  "trivia",
  "blackjack",
  "slots",
  "duel",
];

function emptyStats(): PlayerStats {
  const byGame = {} as PlayerStats["byGame"];
  for (const game of gameNames) byGame[game] = { played: 0, wins: 0, losses: 0 };
  return { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, wagered: 0, won: 0, lost: 0, byGame };
}

function now(): string {
  return new Date().toISOString();
}

export class JsonDatabase {
  private data: DatabaseFile = { version: 1, updatedAt: now(), players: {}, events: [] };
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly config: BotConfig) {}

  async init(): Promise<void> {
    await fs.mkdir(path.dirname(this.config.databasePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.config.databasePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<DatabaseFile>;
      this.data = {
        version: 1,
        updatedAt: parsed.updatedAt || now(),
        players: parsed.players || {},
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    } catch (error) {
      const fileError = error as NodeJS.ErrnoException;
      if (fileError.code !== "ENOENT") throw error;
      await this.persist();
    }
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  private async persist(): Promise<void> {
    this.data.updatedAt = now();
    const payload = JSON.stringify(this.data, null, 2);
    this.writeQueue = this.writeQueue.then(async () => {
      const temporaryPath = `${this.config.databasePath}.tmp`;
      await fs.writeFile(temporaryPath, payload, "utf8");
      await fs.rename(temporaryPath, this.config.databasePath);
    });
    await this.writeQueue;
  }

  private ensurePlayer(guildId: string, userId: string, username: string): PlayerRecord {
    const key = this.key(guildId, userId);
    const existing = this.data.players[key];
    if (existing) {
      if (existing.username !== username) existing.username = username;
      return existing;
    }
    const timestamp = now();
    const player: PlayerRecord = {
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

  async getPlayer(guildId: string, userId: string, username: string): Promise<PlayerRecord> {
    const player = this.ensurePlayer(guildId, userId, username);
    await this.persist();
    return structuredClone(player);
  }

  async changeBalance(
    guildId: string,
    userId: string,
    username: string,
    amount: number,
  ): Promise<PlayerRecord> {
    const player = this.ensurePlayer(guildId, userId, username);
    const nextBalance = player.balance + amount;
    if (nextBalance < 0) throw new Error("INSUFFICIENT_BALANCE");
    player.balance = nextBalance;
    player.updatedAt = now();
    await this.persist();
    return structuredClone(player);
  }

  async claimDaily(
    guildId: string,
    userId: string,
    username: string,
  ): Promise<{ claimed: boolean; reward: number; nextClaimAt: string; player: PlayerRecord }> {
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

  async recordGame(input: {
    guildId: string;
    userId: string;
    username: string;
    game: GameName;
    result: "win" | "loss" | "draw";
    amount: number;
    opponentId?: string;
  }): Promise<{ player: PlayerRecord; event: GameEvent }> {
    const player = this.ensurePlayer(input.guildId, input.userId, input.username);
    const payout = input.result === "win" ? input.amount : input.result === "loss" ? -input.amount : 0;
    if (player.balance + payout < 0) throw new Error("INSUFFICIENT_BALANCE");
    player.balance += payout;
    player.updatedAt = now();
    player.stats.gamesPlayed += 1;
    player.stats.wagered += input.amount;
    if (input.result === "win") {
      player.stats.wins += 1;
      player.stats.won += input.amount;
    } else if (input.result === "loss") {
      player.stats.losses += 1;
      player.stats.lost += input.amount;
    } else {
      player.stats.draws += 1;
    }
    const gameStats = player.stats.byGame[input.game];
    gameStats.played += 1;
    if (input.result === "win") gameStats.wins += 1;
    if (input.result === "loss") gameStats.losses += 1;
    const event: GameEvent = {
      id: randomUUID(),
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

  async recordDuel(input: {
    guildId: string;
    winnerId: string;
    winnerName: string;
    loserId: string;
    loserName: string;
    amount: number;
  }): Promise<{ winner: PlayerRecord; loser: PlayerRecord }> {
    const winner = this.ensurePlayer(input.guildId, input.winnerId, input.winnerName);
    const loser = this.ensurePlayer(input.guildId, input.loserId, input.loserName);
    if (loser.balance < input.amount) throw new Error("OPPONENT_INSUFFICIENT_BALANCE");
    loser.balance -= input.amount;
    winner.balance += input.amount;
    const timestamp = now();
    winner.updatedAt = timestamp;
    loser.updatedAt = timestamp;
    this.applyStats(winner, "duel", "win", input.amount);
    this.applyStats(loser, "duel", "loss", input.amount);
    this.data.events.unshift(
      {
        id: randomUUID(),
        guildId: input.guildId,
        userId: winner.userId,
        game: "duel",
        result: "win",
        amount: input.amount,
        balanceAfter: winner.balance,
        createdAt: timestamp,
        opponentId: loser.userId,
      },
      {
        id: randomUUID(),
        guildId: input.guildId,
        userId: loser.userId,
        game: "duel",
        result: "loss",
        amount: input.amount,
        balanceAfter: loser.balance,
        createdAt: timestamp,
        opponentId: winner.userId,
      },
    );
    this.data.events = this.data.events.slice(0, 2000);
    await this.persist();
    return { winner: structuredClone(winner), loser: structuredClone(loser) };
  }

  private applyStats(player: PlayerRecord, game: GameName, result: "win" | "loss", amount: number): void {
    player.stats.gamesPlayed += 1;
    player.stats.wagered += amount;
    const gameStats = player.stats.byGame[game];
    gameStats.played += 1;
    if (result === "win") {
      player.stats.wins += 1;
      player.stats.won += amount;
      gameStats.wins += 1;
    } else {
      player.stats.losses += 1;
      player.stats.lost += amount;
      gameStats.losses += 1;
    }
  }

  async leaderboard(guildId: string, limit = 10): Promise<PlayerRecord[]> {
    return Object.values(this.data.players)
      .filter((player) => player.guildId === guildId)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, limit)
      .map((player) => structuredClone(player));
  }

  async recentEvents(guildId: string, limit = 10): Promise<GameEvent[]> {
    return this.data.events.filter((event) => event.guildId === guildId).slice(0, limit).map((event) => structuredClone(event));
  }
}