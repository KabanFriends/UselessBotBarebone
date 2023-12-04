import { APIApplicationCommandOption, Client, CommandInteraction, ComponentEmojiResolvable } from "discord.js"
import { CommandArguments } from "../class/CommandArguments";
import { LoadedCommand } from "../cache";

type CommandInitOptions = {
    client: Client;
    cmd: LoadedCommand;
};

type CommandRunOptions = {
    client: Client;
    interaction: CommandInteraction;
    args: CommandArguments;
};

export interface CommandCategory {
    name: string,
    emoji?: ComponentEmojiResolvable
};

export class Categories {
    public static readonly Utility: CommandCategory = { name: "utility", emoji: "📝" };
    public static readonly Miscellaneous: CommandCategory = { name: "miscellaneous", emoji: "🏷️" };
}

export const categoryList = [ Categories.Utility, Categories.Miscellaneous ];

export declare interface Command {
    name?: string;
    options: APIApplicationCommandOption[];
    categories: CommandCategory[];
    guildOnly?: boolean;
    nsfw?: boolean;
    ignore?: boolean;
    init?({client, cmd}: CommandInitOptions): Promise<void>;
    run({client, interaction, args}: CommandRunOptions): Promise<void>;
}