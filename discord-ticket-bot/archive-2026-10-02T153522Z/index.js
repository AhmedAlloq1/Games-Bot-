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
// COMMANDS
// =====================================================

client.commands = new Collection();

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
// EVENTS
// =====================================================

const eventsPath = path.join(
  __dirname,
  'events'
);

let eventFiles = fs.existsSync(eventsPath)
  ? fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith('.js'))
  : [];


// =====================================================
// IMPORTANT
// =====================================================
// لو فيه نسخ احتياطية مثل:
//
// interactionCreate(1).js
// interactionCreate(2).js
// interactionCreate - Copy.js
//
// لا نحملها.
// النسخة الأساسية فقط هي:
//
// interactionCreate.js
//
// =====================================================

eventFiles = eventFiles.filter((file) => {

  const lower = file.toLowerCase();

  // تجاهل نسخ interactionCreate الاحتياطية
  if (
    lower !== 'interactioncreate.js' &&
    lower.startsWith('interactioncreate')
  ) {
    console.warn(
      `[EVENTS] Ignoring backup interaction file: ${file}`
    );

    return false;
  }

  return true;
});


// =====================================================
// LOAD EVENTS
// =====================================================

const registeredEvents = new Set();

for (const file of eventFiles) {

  try {

    const filePath = path.join(
      eventsPath,
      file
    );

    const loaded = require(filePath);

    const events = Array.isArray(loaded)
      ? loaded
      : [loaded];


    for (const event of events) {

      if (
        !event?.name ||
        !event?.execute
      ) {

        console.warn(
          `[EVENTS] Skipping ${file}: missing "name" or "execute" export.`
        );

        continue;
      }


      // =================================================
      // PREVENT DUPLICATE EVENT
      // =================================================

      if (registeredEvents.has(event.name)) {

        console.warn(
          `[EVENTS] Duplicate event skipped: ${event.name} from ${file}`
        );

        continue;
      }


      registeredEvents.add(
        event.name
      );


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


      console.log(
        `[EVENTS] Loaded: ${event.name} <- ${file}`
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
// INTERACTION DEBUG
// =====================================================

const interactionListeners =
  client.listenerCount('interactionCreate');

console.log(
  `[EVENTS] InteractionCreate listeners: ${interactionListeners}`
);

if (interactionListeners !== 1) {

  console.error(
    `[EVENTS] WARNING: Expected exactly 1 InteractionCreate listener, found ${interactionListeners}`
  );
}


// =====================================================
// READY
// =====================================================

client.once(
  'ready',
  () => {

    console.log(
      `[READY] Logged in as ${client.user.tag}`
    );

    console.log(
      `[READY] Serving guild: ${config.guildId}`
    );
  }
);


// =====================================================
// SAFETY NETS
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

  .catch((error) => {

    console.error(
      '[LOGIN] Failed to log in. Check that TOKEN is correct:',
      error
    );

    process.exit(1);
  });