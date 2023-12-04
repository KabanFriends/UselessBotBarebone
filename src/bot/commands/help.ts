import log4js from "log4js";
import * as cache from "../cache";
import { Command, Categories, categoryList, CommandCategory } from "../interface/Command";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from "discord.js";
import { guildlang, locstring } from "../../lang/lang";
import { getEmbedColor } from "../util";
import { format } from "util";
import { TimedEvent } from "../class/TimedEvent";

import config from "../../../config/shared.json";

const logger = log4js.getLogger();

const sortedKeys: string[] = [];
let commandSize = 0;
let longestCmdLen = 0;

export = {
    categories: [
        Categories.Utility,
        Categories.Miscellaneous
    ],
    options: [
        {
            "type": ApplicationCommandOptionType.String,
            "name": "command",
            "required": false,
            "autocomplete": true
        }
    ],

    async init({ client }) {
        const keys = Object.keys(cache.commands);
        commandSize = keys.length;

        // ヘルプ表示用に、コマンドをアルファベット順にソート
        keys.sort().forEach(key => {
            if (key.length > longestCmdLen) {
                longestCmdLen = key.length;
            }
            sortedKeys.push(key);
        });
    },

    async run({ interaction, args, client }) {
        const id = interaction.guild?.id;

        let name = args.get<string>("command");
        let category = "";

        if (!name) {
            let page = 0;

            const message = await interaction.reply({
                embeds: [getListEmbed(page, interaction, category)],
                components: getComponents(page, interaction, category),
                fetchReply: true
            });

            const event = new TimedEvent();
            event.start("interactionCreate", async (click) => {
                if (!click.isButton()) return;
                if (click.message.id !== message.id) return;

                event.accept();

                let totalPages = Math.ceil(commandSize / config.commandsPerHelpPage);

                if (click.customId === "next") {
                    if (page + 1 < totalPages) {
                        page++;
                    }
                } else if (click.customId === "previous") {
                    if (page > 0) {
                        page--;
                    }
                } else if (click.customId.startsWith("category:")) {
                    const cid = click.customId.replaceAll("category:", "");
                    category = cid;
                    page = 0;
                }

                click.update({
                    embeds: [getListEmbed(page, interaction, category)],
                    components: getComponents(page, interaction, category)
                });
            });
        } else {
            name = name.toLowerCase();
            if (name.startsWith("/")) name = name.substring(1);

            if (name in cache.commands) {
                let desc = locstring(`command.${name}.$fullDescription`, guildlang(id));
                if (desc === `command.${name}.$fullDescription`) {
                    desc = locstring(`command.${name}.$description`, guildlang(id));
                }

                const embed = new EmbedBuilder()
                    .setTitle(format(locstring("command.help.embed.title", guildlang(id)), process.env.npm_package_version))
                    .setColor(getEmbedColor())
                    .addFields(
                        {
                            name: format(locstring("command.help.embed.command", guildlang(id)), name),
                            value: desc
                        }
                    );

                interaction.reply({ embeds: [embed] })
            } else {
                interaction.reply({
                    content: locstring("command.help.invalid", guildlang(id)),
                    ephemeral: true
                })
            }
        }
    }
} as Command;

function getListEmbed(page: number, interaction: CommandInteraction, category: string): EmbedBuilder {
    const id = interaction.guild?.id;
    let bodyText = "";

    let cmds = sortedKeys;
    let size = commandSize;
    if (category !== "") {
        cmds = cache.categoryMap[category];
        size = cache.categoryMap[category].length;
    }

    for (let i = 0; i < config.commandsPerHelpPage; i++) {
        let index = (config.commandsPerHelpPage * page) + i;

        if (index < size) {
            const cmd = cache.commands[cmds[index]];
            let name = cmd.name + " ".repeat(longestCmdLen - cmd.name.length);
            const desc = locstring(`command.${cmd.name}.$description`, guildlang(id));
            let cat = "";
            if (category === "" && cmd.categories.length > 0) {
                cat = format(locstring("command.help.embed.categoryFormat", guildlang(id)), locstring(`category.${cmd.categories[0].name}.name`, guildlang(id)));
            } else {
                cat = " ";
            }

            if (i > 0) bodyText += '\n';
            bodyText += `\`/${name} \`${cat}${desc}`;
        }
    }

    let totalPages = Math.ceil(size / config.commandsPerHelpPage);
    let title = format(locstring("command.help.embed.page", guildlang(id)), page + 1, totalPages);
    if (category !== "") {
        title = format(locstring("command.help.embed.page.category", guildlang(id)), locstring(`category.${category}.name`, guildlang(id)), page + 1, totalPages);
    }

    const embed = new EmbedBuilder()
        .setTitle(format(locstring("command.help.embed.title", guildlang(id)), process.env.npm_package_version))
        .setColor(getEmbedColor())
        .setDescription(`${format(locstring("command.help.embed.description", guildlang(id)), commandSize)}\n‪‪`)
        .addFields({
            name: title,
            value: bodyText ? bodyText : " "
        });

    return embed;
}

const categoryOrder: CommandCategory[][] = [
    [ Categories.Utility, Categories.Miscellaneous ]
];

function getComponents(page: number, interaction: CommandInteraction, category: string): ActionRowBuilder<any>[] {
    const id = interaction.guild?.id;
    const rows: ActionRowBuilder<any>[] = [];

    let size = commandSize;
    if (category !== "") {
        size = cache.categoryMap[category].length;
    }

    const row = new ActionRowBuilder();
    const prev = new ButtonBuilder()
        .setLabel(locstring("command.help.button.previous", guildlang(id)))
        .setCustomId("previous")
        .setStyle(ButtonStyle.Primary)
        .setEmoji({ name: "⬅️" });
    const next = new ButtonBuilder()
        .setLabel(locstring("command.help.button.next", guildlang(id)))
        .setCustomId("next")
        .setStyle(ButtonStyle.Primary)
        .setEmoji({ name: "➡️" });
    const totalPages = Math.ceil(size / config.commandsPerHelpPage);

    if (page == 0) {
        prev.setDisabled(true);
    }
    if (page >= totalPages - 1) {
        next.setDisabled(true);
    }

    row.addComponents(prev, next);
    rows.push(row);

    /* カテゴリーボタン */
    let count = 0;
    for (let i = 0; i < categoryOrder.length; i++) {
        const crow = new ActionRowBuilder();
        const catlist = categoryOrder[i];
        for (let j = 0; j < catlist.length; j++) {
            count++;
            /* 一番最初に「すべて」のボタンを挿入 */
            if (i === 0 && count === 1) {
                const all = new ButtonBuilder()
                    .setLabel(locstring("command.help.button.all", guildlang(id)))
                    .setCustomId("category:")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(category === "");
                crow.addComponents(all);
                j--;
                continue;
            }
            const cat = catlist[j];

            const button = new ButtonBuilder()
                .setLabel(locstring(`category.${cat.name}.name`, guildlang(id)))
                .setCustomId("category:" + cat.name)
                .setStyle(ButtonStyle.Secondary);

            if (cat.emoji) {
                button.setEmoji(cat.emoji);
            }

            if (cat.name === category) {
                button.setDisabled(true);
            }

            crow.addComponents(button);
        }
        rows.push(crow);
    }

    return rows;
}
