// index.js

const fs = require('fs');
const path = require('path');

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require('discord.js');

const config = require('./utils/config');

config.requireCore();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ],

  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
  ],
});

client.commands = new Collection();


// =====================================================
// LOAD SLASH COMMANDS
// =====================================================

const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs.existsSync(commandsPath)
  ? fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'))
  : [];

for (const file of commandFiles) {
  try {
    const command = require(
      path.join(commandsPath, file)
    );

    if (!command?.data || !command?.execute) {
      console.warn(
        `[COMMANDS] Skipping ${file}: missing "data" or "execute" export.`
      );

      continue;
    }

    client.commands.set(
      command.data.name,
      command
    );

  } catch (err) {
    console.error(
      `[COMMANDS] Failed to load ${file}:`,
      err
    );
  }
}


// =====================================================
// LOAD EVENTS
// =====================================================

const eventsPath = path.join(__dirname, 'events');

const eventFiles = fs.existsSync(eventsPath)
  ? fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith('.js'))
  : [];

for (const file of eventFiles) {
  try {
    const loaded = require(
      path.join(eventsPath, file)
    );

    // الملف ممكن يصدّر Event واحد
    // أو Array من الـEvents
    const events = Array.isArray(loaded)
      ? loaded
      : [loaded];

    for (const event of events) {

      if (!event?.name || !event?.execute) {
        console.warn(
          `[EVENTS] Skipping an entry in ${file}: missing "name" or "execute" export.`
        );

        continue;
      }


      // =================================================
      // منع تسجيل InteractionCreate أكثر من مرة
      // =================================================

      if (
        event.name === 'interactionCreate' &&
        client.listenerCount('interactionCreate') > 0
      ) {
        console.warn(
          `[EVENTS] Skipping duplicate InteractionCreate from ${file}`
        );

        continue;
      }


      // =================================================
      // REGISTER EVENT
      // =================================================

      if (event.once) {
        client.once(
          event.name,
          (...args) => event.execute(...args)
        );

      } else {
        client.on(
          event.name,
          (...args) => event.execute(...args)
        );
      }

    }

  } catch (err) {
    console.error(
      `[EVENTS] Failed to load ${file}:`,
      err
    );
  }
}


// =====================================================
// EVENT CHECK
// =====================================================

console.log(
  `[EVENT CHECK] InteractionCreate listeners: ${client.listenerCount('interactionCreate')}`
);


// =====================================================
// GLOBAL SAFETY NETS
// =====================================================

// منع توقف البوت بسبب Promise غير متعامل معها
process.on(
  'unhandledRejection',
  (err) => {
    console.error(
      '[UNHANDLED REJECTION]',
      err
    );
  }
);


// منع توقف البوت بسبب Exception غير متعامل معها
process.on(
  'uncaughtException',
  (err) => {
    console.error(
      '[UNCAUGHT EXCEPTION]',
      err
    );
  }
);


// =====================================================
// LOGIN
// =====================================================

client
  .login(config.token)
  .catch((err) => {

    console.error(
      '[LOGIN] Failed to log in. Check that TOKEN is correct:',
      err
    );

    process.exit(1);
  });