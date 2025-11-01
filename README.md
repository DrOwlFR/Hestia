# *Hestia*

*Hestia* is a French bot created for the Discord server of a writing community. Its main purpose is to link each user's account on the site to their Discord account in order to assign them the appropriate role (via the site's API). The other goal is to allow specific roles to be added on Discord based on criteria such as seniority on the server and number of messages sent.

The name *Hestia* comes from the Greek virgin goddess of the hearth and the home.

This bot uses the [sheweny](https://sheweny.js.org/) framework to simplify its use and creation. As well as a Mongo database for storing information.

## Commands

### Administration

| Name         | Description                            | Sub-commands | Usage        | Cd     |
| ------------ | -------------------------------------- | ------------ | ------------ | ------ |
| buttonspanel | Send the button panel                  | None         | No arguments | 3secs  |
| rules        | Send the rules from the Garden server. | None         | No arguments | 3secs  |

### Dev

| Name           | Description                                                                  | Sub-commands | Usage        | Cd     |
| -------------- | ---------------------------------------------------------------------------- | ------------ | ------------ | ------ |
| cleaningroles  | Removes the ampersand/seed role from members who are not linked to the site. | None         | No arguments | 3secs  |
| emit           | Sends a Discord event of your choice.                                        | None         | [event]      | 3secs  |
| getlinkedusers | Returns whether the Discord ID is linked to an account on the site.          | None         | [discordId]  | 3secs  |
| say            | Make the bot speak.                                                          | None         | [message]    | 3secs  |

### Misc

| Name    | Description                        | Sub-commands | Usage        | Cd     |
| ------- | ---------------------------------- | ------------ | ------------ | ------ |
| botinfo | Returns information about the bot. | None         | No arguments | 3secs  |
| ping    | Ping pong.                         | None         | No arguments | 3secs  |

### Util

| Name       | Description                                                                  | Sub-commands | Usage        | Cd     |
| ---------- | ---------------------------------------------------------------------------- | ------------ | ------------ | ------ |
| help       | Displays the list of commands, or help on a specific command.                | None         | <command>    | 3secs  |

### How to install

1. Clone the repo.
2. Rename the file `config.template.ts` — located in `src/structures` — to `config.ts`, type your token and the database token.
3. Install dependencies: `npm install`.
4. Build typescripts file : `npm run build`.
4. Start the bot: `npm run start`.