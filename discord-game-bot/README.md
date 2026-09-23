# ZN-MAZEN Discord Game Bot

بوت ألعاب واقتصاد خفيف لـ Discord.js v14. يدعم أكثر من Server في نفس التشغيل، ويعزل الرصيد والترتيب والإحصائيات بمفتاح مركب من `guildId + userId`.

## المزايا

- 13 Slash Commands مسجلة من مصدر واحد.
- ثماني ألعاب: Coinflip، Dice، Rock Paper Scissors، Guess، Trivia، Blackjack، Slots، Duel.
- رصيد ابتدائي ومكافأة يومية واقتصاد محفوظ في JSON.
- قناة ألعاب إلزامية لكل أوامر الألعاب من خلال `GAME_CHANNEL_ID`.
- ترتيب وإحصائيات مستقلة لكل Server.
- كتابة ذرية للبيانات عبر ملف مؤقت ثم `rename` لتقليل خطر تلف الملف.
- تسجيل أخطاء وأحداث Discord بطريقة واضحة.
- يدعم تسجيل الأوامر عالميًا أو داخل Server محدد أثناء التطوير.

## المتطلبات

- Node.js 20 أو أحدث.
- pnpm 10 أو أحدث.
- تطبيق Bot في Discord Developer Portal مع Bot Token.
- صلاحية `applications.commands` وصلاحية البوت للدخول إلى السيرفر.

## الإعداد

1. ادخل إلى مجلد البوت:

   ```bash
   cd apps/discord-game-bot
   ```

2. ثبّت الاعتماديات:

   ```bash
   pnpm install
   ```

3. أنشئ ملف البيئة:

   ```bash
   cp .env.example .env
   ```

4. املأ القيم التالية:

   | المتغير | الوصف |
   | --- | --- |
   | `DISCORD_TOKEN` | توكن البوت، لا ترفعه إلى Git |
   | `CLIENT_ID` | Application ID من Discord |
   | `GUILD_ID` | اختياري؛ يجعل التسجيل فوريًا داخل Server واحد |
   | `GAME_CHANNEL_ID` | معرّف القناة التي يسمح فيها بكل الألعاب |
   | `DATABASE_PATH` | مسار ملف JSON، والقيمة الافتراضية `./data/database.json` |
   | `STARTING_BALANCE` | رصيد الحساب عند أول استخدام |
   | `DAILY_REWARD` | قيمة المكافأة اليومية |
   | `LOG_LEVEL` | `debug` أو `info` أو `warn` أو `error` |

## تسجيل Slash Commands

تأكد من وجود `.env` ثم شغّل:

```bash
pnpm run deploy
```

عند وجود `GUILD_ID` تُسجل الأوامر داخل ذلك السيرفر فقط. بدونها تُسجل عالميًا، وقد يستغرق Discord وقتًا حتى تظهر.

ملف `deploy-commands.js` يستدعي نفس سجل الأوامر المستخدم من البوت، لذلك لا توجد قائمة ثانية يمكن أن تصبح قديمة.

## التشغيل

للتطوير مع إعادة التشغيل التلقائي:

```bash
pnpm run dev
```

لبناء وتشغيل نسخة JavaScript:

```bash
pnpm run build
pnpm run start
```

من جذر المستودع يمكن استخدام:

```bash
pnpm --filter @workspace/discord-game-bot run typecheck
pnpm --filter @workspace/discord-game-bot run deploy
```

## الأوامر

### الحساب والاقتصاد

- `/help` — عرض الأوامر.
- `/profile [user]` — عرض الرصيد والإحصائيات.
- `/balance` — عرض الرصيد الحالي.
- `/daily` — مكافأة مرة كل 24 ساعة.
- `/leaderboard` — ترتيب أعلى الأرصدة داخل السيرفر الحالي.

### الألعاب

- `/coinflip bet choice` — صورة أو كتابة، ومكسب يساوي الرهان.
- `/dice bet guess` — تخمين 1 إلى 6، والمكسب أربعة أضعاف الرهان.
- `/rps bet choice` — حجر أو ورق أو مقص.
- `/guess bet number` — تخمين رقم من 1 إلى 10، والمكسب ثمانية أضعاف الرهان.
- `/trivia answer` — سؤال معلومات عامة مع أربعة خيارات، والمكافأة 100 coins.
- `/blackjack bet` — جولة بلاك جاك تلقائية.
- `/slots bet` — ثلاثة رموز مع مكافأة الزوج أو Jackpot.
- `/duel opponent bet` — مواجهة عشوائية بين لاعبين، والرهان متساوٍ.

كل أوامر الألعاب تفحص `GAME_CHANNEL_ID` قبل تنفيذ أي نتيجة أو تعديل رصيد.

## شكل قاعدة البيانات

يُنشأ الملف في `DATABASE_PATH` تلقائيًا بعد أول تشغيل. يحتوي على:

- `players`: سجل لكل لاعب بمفتاح `${guildId}:${userId}`.
- `balance`: الرصيد الخاص باللاعب داخل ذلك السيرفر.
- `stats`: عدد الألعاب والانتصارات والخسائر والرهانات حسب اللعبة.
- `events`: آخر 2000 نتيجة للمراجعة.

لا يحتوي هذا المشروع على بيانات Discord سرية داخل المستودع. اترك `.env` و`data/database.json` خارج Git.

## هيكل المصدر

```text
src/
  commands/          كل Slash Commands وسجل مركزي لها
  config/            قراءة والتحقق من متغيرات البيئة
  database/          قاعدة JSON وحفظ الاقتصاد
  events/            ready و interactionCreate وأحداث Discord
  types/             أنواع اللاعب والألعاب والأوامر
  utils/             العشوائية والتنسيق والتحقق والـ embeds والتسجيل
  deploy-commands.ts تسجيل الأوامر عبر Discord REST
  index.ts           نقطة تشغيل البوت
```

## الأمان والنسخ الاحتياطي

- لا تشارك `DISCORD_TOKEN` ولا تضعه في ZIP أو Git.
- لا تستخدم ملف `.env.example` كملف تشغيل؛ انسخه إلى `.env` وأدخل القيم محليًا.
- خذ نسخة من `data/database.json` قبل أي نقل أو ترقية.
- إذا ظهر توكن في سجل أو مستودع، أعد توليده فورًا من Discord Developer Portal.

## استكشاف الأخطاء

- **الأوامر لا تظهر:** شغّل `pnpm run deploy` وتأكد من `CLIENT_ID` و`GUILD_ID`.
- **اللعبة ترفض التنفيذ:** تأكد أن القناة الحالية تطابق `GAME_CHANNEL_ID`.
- **البوت لا يبدأ:** راجع وجود `DISCORD_TOKEN` و`CLIENT_ID` و`GAME_CHANNEL_ID` وعدم وجود مسافات زائدة.
- **الرصيد لا يُحفظ:** تأكد أن مجلد `DATABASE_PATH` قابل للكتابة.