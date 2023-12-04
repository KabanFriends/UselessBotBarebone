import log4js from "log4js";
import fs from "fs";
import zlib from "zlib";
import ExtensibleCustomError from "extensible-custom-error";
import * as bot from "../bot/bot";
import { isProduction } from "../runtime/properties";
import { consoleLogAppender } from "./appenders/console-log";
import { fileLogAppender } from "./appenders/file-log";

class UnhandledError extends ExtensibleCustomError {};

var logWriteStream: fs.WriteStream;

async function gzipFile(filePath: string) {
    const stream = fs.createReadStream(filePath);
    const date = fs.statSync(filePath).birthtime;

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${date.getFullYear()}-${month}-${day}`;

    let name = `./logs/${formatted}-1.log.gz`;
    let i = 1;
    while (fs.existsSync(name)) {
        i++;
        name = `./logs/${formatted}-${i}.log.gz`;
    }

    await new Promise(resolve => stream
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream(name))
        .on("finish", resolve)
    );

    fs.rmSync(filePath);
}

export async function init() {
    let dir = "./logs";
    if (fs.existsSync(dir)) {
        let latest = "./logs/latest.log";
        if (fs.existsSync(latest)) {
            await gzipFile(latest);
        }
    } else {
        fs.mkdirSync(dir);
    }

    logWriteStream = fs.createWriteStream("./logs/latest.log");

    log4js.configure({
        levels: {
            REMOVE: {value: 21200, colour: "red"},
            ADD: {value: 21100, colour: "green"},
            READY: {value: 21000, colour: "green"},
            INFO: {value: 20000, colour: "white"},
        },
        appenders: {
            console: {
                type: consoleLogAppender,
                layout: {
                    type: "pattern",
                    pattern: "%[[%d %p]: %m%]"
                }
            },
            file: {
                type: fileLogAppender,
                layout: {
                    type: "pattern",
                    pattern: "[%d %p]: %m"
                }
            }
        },
        categories: {
            default: {
                appenders: ["console", "file"],
                level: isProduction() ? "info" : "all"
            }
        }
    });

    const logger = log4js.getLogger();

    /* 未処理のエラー */
    process.on("uncaughtException", async (err) => {
        logger.error(new UnhandledError("未処理のエラー (uncaughtException)", err));
        await bot.shutdown();
    });

    process.on("unhandledRejection", async (err) => {
        logger.error(new UnhandledError("未処理のエラー (unhandledRejection)", <Error>err));
    });
}

export async function writeLogLine(message: string) {
    logWriteStream.write(`${message}\n`);
}

export async function closeLogFile() {
    logWriteStream.close();
}
