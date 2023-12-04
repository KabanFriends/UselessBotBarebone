import log4js from "log4js";
import * as bot from "../bot";
import { Events, Guild } from "discord.js";

const logger = log4js.getLogger();

export = {
    on: Events.GuildCreate,
    async run(guild: Guild) {
        logger.log("ADD", `BOTがサーバー ${guild.name} (${guild.id}) に追加されました`);
    }
}