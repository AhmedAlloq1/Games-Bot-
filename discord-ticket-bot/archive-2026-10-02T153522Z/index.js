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


// =====================================================
// CONFIG
// =====================================================

config.requireCore();


// =====================================================
// CLIENT
// =====================================================

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


// =====================================================
// COMMANDS COLLECTION
// =====================================================

client.commands = new Collection();


// =====================================================
// LOAD SLASH COMMANDS
// =====================================================

const commandsPath = path.join(
  __dirname,
  'commands'
);

const commandFiles = fs.existsSync(commandsPath)
  ? fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'))
  : [];

for (const file of commandFiles) {

  try {

    const filePath = path.join(
      commandsPath,
      file
    );

    const command = require(filePath);

    if (
      !command?.data ||
      !command?.execute
    ) {

      console.warn(
        `[COMMANDS] Skipping ${file}: missing "data" or "execute" export.`
      );

      continue;
    }

    client.commands.set(
      command.data.name,
      command
    );

    console.log(
      `[COMMANDS] Loaded: ${command.data.name}`
    );

  } catch (error) {

    console.error(
      `[COMMANDS] Failed to load ${file}:`,
      error
    );
  }
}


// =====================================================
// LOAD EVENTS
// =====================================================

const eventsPath = path.join(
  __dirname,
  'events'
);

const eventFiles = fs.existsSync(eventsPath)
  ? fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith('.js'))
  : [];


// مهم جدًا:
// يمنع تسجيل نفس Discord event أكثر من مرة
const registeredEvents = new Set();


for (const file of eventFiles) {

  try {

    const filePath = path.join(
      eventsPath,
      file
    );

    const loaded = require(filePath);

    // الملف ممكن يحتوي Event واحد أو Array
    const events = Array.isArray(loaded)
      ? loaded
      : [loaded];


    for (const event of events) {

      if (
        !event?.name ||
        !event?.execute
      ) {

        console.warn(
          `[EVENTS] Skipping an entry in ${file}: missing "name" or "execute" export.`
        );

        continue;
      }


      // =================================================
      // PREVENT DUPLICATE EVENT LISTENERS
      // =================================================

      if (registeredEvents.has(event.name)) {

        console.error(
          `[EVENTS] DUPLICATE EVENT BLOCKED: "${event.name}" from file "${file}"`
        );

        continue;
      }


      registeredEvents.add(event.name);


      // =================================================
      // REGISTER EVENT
      // =================================================

      if (event.once) {

        client.once(
          event.name,
          (...args) =>
            event.execute(...args)
        );

      } else {

        client.on(
          event.name,
          (...args) =>
            event.execute(...args)
        );
      }


      console.log(
        `[EVENTS] Loaded: ${event.name} ← ${file}`
      );
    }


  } catch (error) {

    console.error(
      `[EVENTS] Failed to load ${file}:`,
      error
    );
  }
}


// =====================================================
// DEBUG: CHECK INTERACTIONCREATE LISTENERS
// =====================================================

console.log(
  `[EVENTS] InteractionCreate listeners: ${
    client.listenerCount('interactionCreate')
  }`
);

if (
  client.listenerCount('interactionCreate') > 1
) {

  console.error(
    '[EVENTS] WARNING: More than one InteractionCreate listener is registered!'
  );
}


// =====================================================
// GLOBAL SAFETY NETS
// =====================================================

process.on(
  'unhandledRejection',
  (error) => {

    console.error(
      '[UNHANDLED REJECTION]',
      error
    );
  }
);


process.on(
  'uncaughtException',
  (error) => {

    console.error(
      '[UNCAUGHT EXCEPTION]',
      error
    );
  }
);


// =====================================================
// LOGIN
// =====================================================

client
  .login(config.token)

  .then(() => {

    console.log(
      '[LOGIN] Discord login successful.'
    );

  })

  .catch((error) => {

    console.error(
      '[LOGIN] Failed to log in. Check that TOKEN is correct:',
      error
    );

    process.exit(1);
  });