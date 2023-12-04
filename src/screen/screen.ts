import log4js from "log4js";
import serverline from "serverline";
import fs from "fs";
import ExtensibleCustomError from "extensible-custom-error";
import * as logging from "../logging/logging";
import * as bot from "../bot/bot";
import { ScreenCommand } from "./interface/ScreenCommand";

class ScreenCommandLoadError extends ExtensibleCustomError {};
class ScreenComandError extends ExtensibleCustomError {};

const logger = log4js.getLogger();
const commands: {[key: string]: ScreenCommand} = {};

export async function init() {
    serverline.init();
}

export async function initCommands() {
    /* コマンド読み込み */
    const names: Array<string> = [];
    const files = fs.readdirSync("./src/screen/commands").filter(file => file.endsWith(".ts"));
    for (const file of files) {
        logger.debug(`コンソールコマンド読込: ${file}`);
        try {
            const cmd = <ScreenCommand>await import(`./commands/${file}`);
            names.push(cmd.name);
            commands[cmd.name.toLowerCase()] = cmd;
        } catch (err) {
            logger.error(new ScreenCommandLoadError(`コンソールコマンド ${file} の読込中にエラーが発生しました`, <Error>err));
        }
    }
    serverline.setCompletion(names);

    /* イベント設定 */
    serverline.on("SIGINT", async () => {
        await bot.shutdown();
    });

    serverline.on("line", async (line) => {
        if (line === "") return;

        const split = line.split(" ");
        const cmd = split[0].toLowerCase();
        const args = split.slice(1);

        logging.writeLogLine(`> ${line}`);
        if (cmd in commands) {
            const cmdObj = commands[cmd];
            try {
                await cmdObj.run(args);
            } catch (err) {
                logger.error(new ScreenComandError(`コンソールコマンド ${cmd} でエラーが発生しました`, <Error>err));
            }
        } else {
            logger.warn(`不明なコンソールコマンド (${cmd})`);
        }
    });
}

export function getComandMap(): {[key: string]: ScreenCommand} {
    return commands;
}