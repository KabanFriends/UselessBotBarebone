import log4js from "log4js";
import * as bot from "../../bot/bot";
import { ScreenCommand } from "../interface/ScreenCommand";

const logger = log4js.getLogger();

export = {
    name: "stop",
    async run(args) {
        await bot.shutdown();
    }
} as ScreenCommand;