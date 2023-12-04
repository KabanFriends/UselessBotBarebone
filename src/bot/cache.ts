import { APIApplicationCommand } from "discord.js";
import { CommandCategory } from "./interface/Command";

export interface LoadedCommand {
    name: string;
    categories: CommandCategory[];
    discord: APIApplicationCommand;
    argMap: {[key: string]: string};
    init?(...args: any[]): Promise<void>;
    run(...args: any[]): Promise<void>;
}

export const commands: {[key: string]: LoadedCommand} = {};
export const categoryMap: {[key: string]: string[]} = {};
