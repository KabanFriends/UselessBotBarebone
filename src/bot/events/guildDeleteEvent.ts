import log4js from "log4js";
import { Events, Guild } from "discord.js";

const logger = log4js.getLogger();

export = {
    on: Events.GuildDelete,
    async run(guild: Guild) {
        logger.log("REMOVE", `BOTがサーバー ${guild.name} (${guild.id}) から削除されました`);
    }
}