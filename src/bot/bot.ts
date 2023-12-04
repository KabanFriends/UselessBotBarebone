import log4js from "log4js";
import * as events from "./events";
import * as logging from "../logging/logging";
import * as lang from "../lang/lang";
import * as commands from "./commands";
import { Client, Partials } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import { DefaultWebSocketManagerOptions } from "@discordjs/ws";

const logger = log4js.getLogger();

/* identifyPropertiesを無理矢理弄ってAndroidステータス表示 */
// https://stackoverflow.com/questions/60411593/how-to-make-bot-status-show-as-online-from-mobile
// https://stackoverflow.com/questions/46634876/how-can-i-change-a-readonly-property-in-typescript
type Mutable<T> = {
    -readonly [k in keyof T]: T[k];
};
const prop = DefaultWebSocketManagerOptions.identifyProperties as Mutable<typeof DefaultWebSocketManagerOptions.identifyProperties>;
prop.browser = "Discord Android" as `@discordjs/ws ${string}`;

/* クライアント設定 */
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
})

export async function init() {
    logger.info("BOTを起動しています")
    client.login(process.env.BOT_TOKEN);

    client.on("ready", async () => {
        if (client.user === null) {
            logger.fatal("BOTユーザーが見つからないため、起動できません。");
            return;
        }

        logger.log("READY", `BOT起動完了\n    ID: ${client.user.id}\n    ユーザー名: ${client.user.tag}\n    サーバー数: ${client.guilds.cache.size}`);

        await lang.init(); // lang初期化
        await events.init(); // イベント登録
        await commands.init(); // コマンド初期化
    });
}

export async function shutdown() {
    logger.info("シャットダウン中…");
    await client.destroy();
    logging.closeLogFile();
    process.exit(0);
}