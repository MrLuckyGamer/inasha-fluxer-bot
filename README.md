# Inasha Fluxer Bot

An all-purpose bot for [Fluxer](https://fluxer.app), ported from the Inasha Discord bot.
Built with [@fluxerjs/core](https://github.com/fluxerjs/core).

[![license](https://img.shields.io/badge/license-LICENSED-green.svg)](./LICENSE.md)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Create a .env file in the project root (see example below)

# 3. Run the bot
npm start

# Or with auto-restart during development
npm run dev
```

`.env` example:

```env
FLUXER_BOT_TOKEN=your_fluxer_bot_token_here
prefix=i>
```

## Configuration

| Variable           | Description                        | Default |
|--------------------|------------------------------------|---------|
| `FLUXER_BOT_TOKEN` | Your Fluxer bot token              | -       |
| `prefix`           | Command prefix                     | `i>`    |

## Deployment (Dokploy)

This bot is deployed via [Dokploy](https://dokploy.com). Set the following environment variables in the app's **Environment** tab:

```env
FLUXER_BOT_TOKEN=your_fluxer_bot_token_here
prefix=i>
```

Build/start commands (Nixpacks or Dockerfile-based deploys both work fine, since this is a plain Node app):

| Setting        | Value         |
|----------------|---------------|
| Build command  | `npm install` |
| Start command  | `npm start`   |
| Node version   | `>=22.13`     |

No exposed port is needed - this bot doesn't run an HTTP server, it just connects out to Fluxer's gateway.

## Commands

### 🛠 Utility
| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `ping`         | Bot and API latency                              |
| `uptime`       | Bot uptime                                       |
| `help`         | List all commands by category                    |
| `botinfo`      | Bot statistics                                   |
| `avatar`       | Show a user's avatar                             |
| `serverinfo`   | Server information                               |
| `userinfo`     | User information                                 |
| `invite`       | Get the bot's invite link                        |
| `serverstats`  | Enable/disable live server stats channels        |
| `autoresponse` | Enable/disable the cat/dog chat auto-replies     |

### 🔨 Moderation
| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `ban`          | Ban a user                                       |
| `kick`         | Kick a user                                      |
| `purge <n>`    | Bulk delete up to 100 messages                   |
| `lock`         | Lock the current channel                         |
| `unlock`       | Unlock the current channel                       |
| `warn`         | Warn / view / delete warnings for a user         |
| `addrole`      | Add a role to a user                             |
| `removerole`   | Remove a role from a user                        |

### 🎉 Fun
| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `coinflip`     | Flip a coin                                      |
| `roll`         | Roll 0–100                                       |
| `rtd [sides]`  | Roll a die (default d6)                          |
| `freaky`       | Check how freaky someone is                      |
| `gay`          | Check how gay someone is                         |
| `ship`         | Love compatibility between two users             |
| `cat`          | Random cat image                                 |
| `hug`          | Hug someone (GIF)                                |
| `kiss`         | Kiss someone (GIF)                               |
| `slap`         | Slap someone (GIF)                               |
| `fish`         | Go fishing (1 hour cooldown)                     |
| `fishlb`       | Fishing leaderboard                              |
| `family`       | Manage your family tree                          |

## Auto-Responses

The bot responds automatically to messages containing:
- `meow` - cat reply 🐱
- `woof`, `bark`, `bork`, `ruff`, `arf` - dog reply 🐶

Both are **on by default** and can be toggled per-server with the `autoresponse` command
(requires **Manage Server** permission):

```
i>autoresponse            # show status of all auto-responses
i>autoresponse cat off    # disable cat replies in this server
i>autoresponse dog on     # re-enable dog replies in this server
```

`ar` and `autoreply` also work as aliases. To add a new auto-response type (e.g. a
`fox` reply), add an entry to `src/autoresponses/index.js` - no other code changes needed.

## Project Structure

```
src/
├── index.js              # entrypoint - wires everything together and logs in
├── config.js              # env-based config (token, prefix)
├── client.js               # Fluxer Client factory
├── handlers/
│   ├── loadCommands.js      # recursively loads src/commands/*.js
│   └── loadEvents.js        # loads src/events/*.js and binds them to the client
├── events/                # one file per Fluxer gateway event
│   ├── ready.js
│   ├── messageCreate.js     # command dispatch + chat auto-responses
│   ├── guildMemberAdd.js
│   ├── guildMemberRemove.js
│   ├── channelCreate.js
│   └── channelDelete.js
├── commands/               # one file per `i>` command (see table above)
├── autoresponses/
│   ├── index.js             # registry of triggers/replies (cat, dog, ...)
│   └── store.js             # per-server enable/disable persistence
└── lib/
    ├── util.js               # path/URL helpers used by the loaders
    └── otakuGifs.js           # otakugifs.xyz API client (hug/kiss/slap)
```

## Data Storage

All persistent data is stored as JSON files in `./data/`:
- `data/fish/` - fishing scores and cooldowns
- `data/familytree/` - family relationships
- `data/serverstats/` - stat channel IDs
- `data/warns/` - user warnings
- `data/autoresponses/` - per-server cat/dog auto-response toggles

## Key Differences from the Discord Version

| Feature               | Discord (discord.js)           | Fluxer (@fluxerjs/core)         |
|-----------------------|--------------------------------|---------------------------------|
| Package               | `discord.js`                   | `@fluxerjs/core`                |
| Module format         | CJS (`require`)                | ESM (`import`)                  |
| Token env var         | `token`                        | `FLUXER_BOT_TOKEN`              |
| Intents               | Required (GatewayIntentBits)   | Not needed (`intents: 0`)       |
| Slash commands        | REST registration              | Not ported (Fluxer handles it)  |
| `message.mentions`    | `Collection` with `.first()`   | Plain array of `User` objects   |
| Ban/Kick              | `member.ban()` / `member.kick()` | `guild.ban(id)` / `guild.kick(id)` |
| Channel permissions   | `permissionOverwrites.edit()`  | `channel.editPermission()`      |

## License

This project is proprietary software - see [LICENSE.md](./LICENSE.md) for full terms.
In short: you may use the bot by inviting it to your server or using its commands, but you may not copy, modify, redistribute, or claim ownership of the source code.
