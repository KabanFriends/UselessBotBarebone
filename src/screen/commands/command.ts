import log4js from "log4js";
import { ScreenCommand } from "../interface/ScreenCommand";
import { isProduction } from "../../runtime/properties";
import { registerDev, registerProd, unregisterDev, unregisterProd } from "../../bot/commands";

const logger = log4js.getLogger();

export = {
    name: "command",
    async run(args) {
        if (args.length === 0) {
            logger.info("command <register|unregister>")
            return;
        }

        const action = args[0].toLocaleLowerCase();
        if (action === "register") {
            isProduction() ? registerProd() : registerDev();
        } else if (action === "unregister") {
            isProduction() ? unregisterProd() : unregisterDev();
        }
    }
} as ScreenCommand;