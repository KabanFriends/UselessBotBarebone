import log4js from "log4js";
import * as bot from "../../bot/bot"
import { ScreenCommand } from "../interface/ScreenCommand";

const logger = log4js.getLogger();

export = {
    name: "leave",
    async run(args) {
        let guildId = args[0];
        const guild = bot.client.guilds.cache.get(guildId);
        if (!guild) {
            throw Error("サーバーが見つかりませんでした");
        }
        await guild.leave();
        logger.info(`サーバー ${guild.name} から退出しました`);
    }
} as ScreenCommand;
