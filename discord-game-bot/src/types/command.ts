import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import type { BotConfig } from "../config/env";
import type { JsonDatabase } from "../database/jsonDatabase";

export type CommandContext = {
  config: BotConfig;
  database: JsonDatabase;
};

export type BotCommand = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  game?: boolean;
  execute: (interaction: ChatInputCommandInteraction, context: CommandContext) => Promise<void>;
};