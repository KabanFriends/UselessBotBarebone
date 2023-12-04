import log4js from "log4js";
import * as cache from "../cache";
import { ApplicationCommandOptionChoiceData, BaseInteraction, Events } from "discord.js";
import { CommandArguments } from "../class/CommandArguments";

const logger = log4js.getLogger();

export = {
    on: Events.InteractionCreate,
    async run(interaction: BaseInteraction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "help") return;

        const keys = Object.keys(cache.commands);

        const args = new CommandArguments(cache.commands["help"].argMap, interaction);

        const input = args.get<string>("command");
        const toAdd: string[] = keys.concat();
        const array: ApplicationCommandOptionChoiceData<string>[] = [];

        for (let i = 0; array.length < 25 && i < toAdd.length; i++) {
            const name = toAdd[i];
            if (name !== undefined && name.startsWith(input)) {
                delete toAdd[i];
                i--;
                array.push({
                    name: name,
                    value: name
                });
            }
        }

        for (let i = 0; array.length < 25 && i < toAdd.length; i++) {
            const name = toAdd[i];
            if (name !== undefined && name.includes(input)) {
                delete toAdd[i];
                i--;
                array.push({
                    name: name,
                    value: name
                });
            }
        }

        interaction.respond(array);
    }
}