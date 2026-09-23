import type { BotCommand } from "../types/command";
import { balanceCommand } from "./balance";
import { blackjackCommand } from "./blackjack";
import { coinflipCommand } from "./coinflip";
import { dailyCommand } from "./daily";
import { diceCommand } from "./dice";
import { duelCommand } from "./duel";
import { guessCommand } from "./guess";
import { helpCommand } from "./help";
import { leaderboardCommand } from "./leaderboard";
import { profileCommand } from "./profile";
import { rpsCommand } from "./rps";
import { slotsCommand } from "./slots";
import { triviaCommand } from "./trivia";

export const commands: BotCommand[] = [
  helpCommand,
  profileCommand,
  balanceCommand,
  dailyCommand,
  leaderboardCommand,
  coinflipCommand,
  diceCommand,
  rpsCommand,
  guessCommand,
  triviaCommand,
  blackjackCommand,
  slotsCommand,
  duelCommand,
];

export const commandMap = new Map(commands.map((command) => [command.data.name, command]));