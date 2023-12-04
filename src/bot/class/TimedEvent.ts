import log4js from "log4js";
import ExtensibleCustomError from "extensible-custom-error";
import * as bot from "../bot";
import { BaseInteraction, ClientEvents, Events } from "discord.js";
import { removeArrayElement } from "../util";

import config from "../../../config/shared.json";

class TimedEventError extends ExtensibleCustomError {};

type RunCallback<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => Promise<void>;
type EventCallback = () => Promise<void>;
type RunHandleCallback<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => Promise<void>;
export type InteractionRunCallback = (interaction: BaseInteraction) => Promise<void>;

const logger = log4js.getLogger();
export const interactionEvents: TimedEvent[] = [];

export class TimedEvent {
    private life: number = config.eventTimeoutSeconds * 1000;
    private timeout: any; // NodeJS.Timeout (何故か認識されない)
    private on: string = ""; // temp
    private accepted: boolean = false;

    public run: RunHandleCallback<any> = async (...args) => {}; // temp
    public close: EventCallback = async () => {}; // temp
    public error: EventCallback = async () => {}; // temp

    public start<K extends keyof ClientEvents>(on: K, run: RunCallback<K>, life?: number) {
        if (life) this.life = life;

        this.on = on;
        this.run = async (...args: ClientEvents[K]) => {
            await handleCallback(this, run, ...args);
        };

        logger.debug(`${this.on} のTimedEventをスタート`)

        this.acceptInternal(true);

        // interactionCreateの時のみ特別処理
        if (this.on === Events.InteractionCreate) {
            interactionEvents.push(this);
            return;
        }
        bot.client.on(this.on, this.run);
    }

    private acceptInternal(first: boolean) {
        // 現在のTimeoutを破棄して、新しく作成
        if (!first) {
            logger.debug(`${this.on} のTimedEventを延長`)
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(async () => {
            logger.debug(`${this.on} のTimedEventを終了`)
            
            try {
                await this.close();
            } catch (err) {
                logger.error(new TimedEventError("TimedEventの終了時にエラーが発生しました", <Error>err));
            }

            // interactionCreateの時のみ特別処理
            if (this.on === Events.InteractionCreate) {
                removeArrayElement(interactionEvents, this);
                return;
            }

            bot.client.removeListener(this.on, this.run);
        }, this.life);
    }

    public accept() {
        this.acceptInternal(false);
        this.accepted = true;
    }

    public async runAcceptable(...args: any): Promise<boolean> {
        this.accepted = false;
        await this.run(...args);
        return this.accepted;
    }

    public onClose(callback: EventCallback) {
        this.close = callback;
    }

    public onError(callback: EventCallback) {
        this.error = callback;
    }
}

export async function handleCallback<T extends keyof ClientEvents>(event: TimedEvent, run: RunCallback<T>, ...args: ClientEvents[T]) {
    try {
        await run(...args);
    } catch (err) {
        logger.error(new TimedEventError("TimedEventでエラーが発生しました", <Error>err));
        try {
            await event.error();
        } catch (err) {
            // fallthrough   
        }
    }
}