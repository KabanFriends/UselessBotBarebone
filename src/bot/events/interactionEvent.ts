import log4js from "log4js";
import * as bot from "../bot";
import * as cache from "../cache";
import ExtensibleCustomError from "extensible-custom-error";
import { BaseInteraction, Events, GuildChannel, InteractionType } from "discord.js";
import { CommandArguments } from "../class/CommandArguments";
import { guildlang, locstring } from "../../lang/lang";
import { interactionEvents } from "../class/TimedEvent";

class CommandError extends ExtensibleCustomError { };

const logger = log4js.getLogger();

export = {
    on: Events.InteractionCreate,
    async run(interaction: BaseInteraction) {
        logger.debug(`インタラクション ${interaction.id} : ${InteractionType[interaction.type]}`);
        const id = interaction.guild?.id;

        /* コマンド */
        if (interaction.isCommand()) {
            const name = interaction.commandName;
            const cmd = cache.commands[name];

            try {
                const args = new CommandArguments(cmd.argMap, interaction);
                let info = "";
                if (interaction.guild) {
                    const ch = <GuildChannel>interaction.channel;
                    info = `\n    サーバー: ${interaction.guild.name} [${interaction.guildId}]\n    チャンネル: #${ch.name} [${ch.id}]`;
                }

                const vals = [];
                for (const id in cmd.argMap) {
                    if (args.has(id)) {
                        vals.push(`${id}="${args.get(id)}"`);
                    }
                }
                const logargs = vals.length == 0 ? "" : " " + vals.join(" ");

                logger.info(`コマンド実行: /${name}${logargs}\n    ユーザー: ${interaction.user.displayName} [${interaction.user.tag}/${interaction.user.id}]${info}`);
                await cmd.run({ client: bot.client, interaction: interaction, args: args });
            } catch (err) {
                logger.error(new CommandError(`コマンド /${name} でエラーが発生しました (ユーザー:${interaction.user.tag})`, <Error>err));

                try {
                    if (interaction.replied) {
                        await interaction.followUp({
                            content: locstring("command.error", guildlang(interaction.guild?.id)),
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: locstring("command.error", guildlang(interaction.guild?.id)),
                            ephemeral: true
                        });
                    }
                } catch (err) {
                    // fallthrough
                }
            }
            return;
        }

        /* TimedEventで作成されたイベント */
        let accepted = false;
        for (const event of interactionEvents) {
            if (await event.runAcceptable(interaction)) {
                accepted = true;
                break;
            }
        }

        if (interaction.isButton() && !accepted) {
            interaction.reply({
                content: locstring("interaction.error.expired", guildlang(id)),
                ephemeral: true
            });
        }
    }
}