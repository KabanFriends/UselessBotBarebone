import log4js from "log4js";
import { ScreenCommand } from "../interface/ScreenCommand";
import { getComandMap } from "../screen";

const logger = log4js.getLogger();

export = {
    name: "help",
    async run(args) {
        const cmds = Object.keys(getComandMap());
        logger.info(`コマンド一覧: ${cmds.join(", ")}`);
    }
} as ScreenCommand;