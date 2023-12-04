import log4js from "log4js";
import { ScreenCommand } from "../interface/ScreenCommand";

const logger = log4js.getLogger();

export = {
    name: "test",
    async run(args) {
        if (args.length == 0) {
            help();
            return;
        }

        switch (args[0]) {
            case "error": errtest(); break;
            case "log": logtest(); break;
            default: help(); break;
        }
    }
} as ScreenCommand;

function help() {
    logger.log("./src/screen/commands/test.ts");
}

function errtest() {
    throw new Error("Dummy error");
}

function logtest() {
    logger.info("Hello, world!");
    logger.log("READY", "Hello, world!");
    logger.warn("Hello, world!");
    logger.error("Hello, world!");
    logger.fatal("Hello, world!");
    logger.mark("Hello, world!");
    logger.debug("Hello, world!");
    logger.trace("Hello, world!");
}
