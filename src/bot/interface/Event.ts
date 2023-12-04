import { ClientEvents } from "discord.js"

export declare interface Event<T extends keyof ClientEvents> {
    on: T;
    run(...args: ClientEvents[T]): Promise<void>;
}