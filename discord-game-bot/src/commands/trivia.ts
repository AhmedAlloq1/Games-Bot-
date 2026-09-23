import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { getPlayerContext, requireGameChannel } from "../utils/interaction";
import { pick } from "../utils/random";

type TriviaQuestion = {
  question: string;
  answers: string[];
  correct: number;
};

const questions: TriviaQuestion[] = [
  { question: "ما هو الكوكب المعروف بالكوكب الأحمر؟", answers: ["الأرض", "المريخ", "الزهرة", "المشتري"], correct: 2 },
  { question: "كم عدد أضلاع المثلث؟", answers: ["2", "3", "4", "5"], correct: 2 },
  { question: "ما عاصمة المملكة العربية السعودية؟", answers: ["جدة", "الرياض", "مكة", "الدمام"], correct: 2 },
  { question: "أي لغة تستخدمها صفحات الويب لوصف هيكلها؟", answers: ["HTML", "CSS", "SQL", "Python"], correct: 1 },
  { question: "كم عدد أيام السنة الميلادية العادية؟", answers: ["360", "364", "365", "366"], correct: 3 },
  { question: "ما أكبر محيط على سطح الأرض؟", answers: ["الأطلسي", "الهندي", "الهادئ", "المتجمد"], correct: 3 },
];

export const triviaCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("أجب عن سؤال معلومات عامة واربح عملات")
    .addIntegerOption((option) =>
      option.setName("answer").setDescription("رقم الإجابة من 1 إلى 4").setMinValue(1).setMaxValue(4).setRequired(true),
    ),
  game: true,
  async execute(interaction, context) {
    if (!(await requireGameChannel(interaction, context))) return;
    const result = await getPlayerContext(interaction, context);
    if (!result) return;
    const question = pick(questions);
    const answer = interaction.options.getInteger("answer", true);
    const correct = answer === question.correct;
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "trivia",
      result: correct ? "win" : "loss",
      amount: correct ? 100 : 0,
    });
    const answerList = question.answers.map((item, index) => `${index + 1}. ${item}`).join("\n");
    const message = correct
      ? `إجابة صحيحة! ربحت **100 coins**.\n\n${question.question}\n${answerList}`
      : `الإجابة الصحيحة هي **${question.answers[question.correct - 1]}**.\n\n${question.question}\n${answerList}`;
    await interaction.reply({
      embeds: [gameEmbed("Trivia", `${message}\n\nرصيدك: **${recorded.player.balance.toLocaleString("en-US")} coins**.`, correct ? colors.success : colors.danger)],
    });
  },
};