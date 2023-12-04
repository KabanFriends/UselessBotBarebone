import log4js from "log4js";
import fs from "fs";
import ExtensibleCustomError from "extensible-custom-error";
import * as bot from "./bot";
import { isProduction } from "../runtime/properties";
import { Event } from "./interface/Event";

class EventError extends ExtensibleCustomError {}

type InferType<T> = T extends Event<infer R> ? Event<R> : never;

const logger = log4js.getLogger();

export async function init() {
    const files = fs.readdirSync("./src/bot/events").filter(file => file.endsWith(".ts"));
    for (const file of files) {
        const name = file.substring(0, file.length - 3);
        if (!isProduction()) {
            logger.debug(`イベント登録: ${name}`);
        }

        const event = <Event<any>> await import(`./events/${file}`);
        const inferred: InferType<typeof event> = event;

        bot.client.on(inferred.on, async (...args) => {
            try {
                await inferred.run(...args);
            } catch (err) {
                logger.error(new EventError(`イベント ${name} でエラーが発生しました`, <Error>err));
            }
        })
    }
}
