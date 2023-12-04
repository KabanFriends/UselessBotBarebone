import log4js from "log4js";
import { Command, Categories } from "../interface/Command";
import { APIApplicationCommandOptionChoice, APIApplicationCommandStringOption, ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { guildlang, langNames, locstring } from "../../lang/lang";
import { commandEmbed, isEmpty } from "../util";
import { db } from "../../database/database";
import { format } from "util";

import config from "../../../config/shared.json";

const logger = log4js.getLogger();

export = {
    categories: [
        Categories.Miscellaneous
    ],
    guildOnly: true,
    options: [
        {
            "type": ApplicationCommandOptionType.String,
            "name": "lang",
            "required": true,
            "choices": []
        },
    ],

    async init({cmd}) {
        for (const code of langNames) {
            const ch: APIApplicationCommandOptionChoice<string> = {
                name: locstring("langName", code),
                value: code
            };

            if (cmd.discord.options === undefined) return;
            (<APIApplicationCommandStringOption>cmd.discord.options[0]).choices?.push(<never>ch);
        }
    },

    async run({interaction, args}) {
        if (isEmpty(interaction.guild) || isEmpty(interaction.member)) return;

        const id = interaction.guild?.id;
        const perms: PermissionsBitField = <PermissionsBitField>interaction.member.permissions;
        if (perms.has(PermissionsBitField.Flags.ManageGuild) || interaction.member.user.id == config.ownerId) {
            const langCode = args.get<string>("lang");

            if (!langNames.includes(langCode)) {
                throw ReferenceError("存在しない言語が指定されました。");
            }

            db.settings.set(interaction.guild.id, langCode, "lang");

            const embed = commandEmbed("lang", guildlang(id))
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setDescription(format(locstring("command.lang.embed.description", langCode), locstring("langName", langCode)));
    
            interaction.reply({embeds: [embed]});
        }else {
            interaction.reply(locstring("command.lang.noPermission", guildlang(id)));
        }
    }
} as Command;
