export type GameName =
  | "coinflip"
  | "dice"
  | "rps"
  | "guess"
  | "trivia"
  | "blackjack"
  | "slots"
  | "duel";

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  wagered: number;
  won: number;
  lost: number;
  byGame: Record<GameName, { played: number; wins: number; losses: number }>;
};

export type PlayerRecord = {
  guildId: string;
  userId: string;
  username: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  lastDailyAt?: string;
  stats: PlayerStats;
};

export type GameEvent = {
  id: string;
  guildId: string;
  userId: string;
  game: GameName;
  result: "win" | "loss" | "draw";
  amount: number;
  balanceAfter: number;
  createdAt: string;
  opponentId?: string;
};

export type DatabaseFile = {
  version: 1;
  updatedAt: string;
  players: Record<string, PlayerRecord>;
  events: GameEvent[];
};