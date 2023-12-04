import log4js from "log4js";
import fs from "fs";
import crypto from "crypto";
import ExtensibleCustomError from "extensible-custom-error";
import * as cache from "./cache";
import * as bot from "./bot";
import { Command, categoryList } from "./interface/Command";
import { LoadedCommand } from "./cache";
import { APIApplicationCommand, APIApplicationCommandBasicOption, APIApplicationCommandIntegerOption, APIApplicationCommandNumberOption, APIApplicationCommandOption, APIApplicationCommandOptionChoice, APIApplicationCommandStringOption, APIApplicationCommandSubcommandGroupOption, APIApplicationCommandSubcommandOption, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import { langNames, locstring } from "../lang/lang";

import config from "../../config/shared.json";

class CommandLoadError extends ExtensibleCustomError {};
class CommandInitError extends ExtensibleCustomError {};
class CommandRegisterError extends ExtensibleCustomError {};

const logger = log4js.getLogger();

export async function init() {
    const files = fs.readdirSync("./src/bot/commands").filter(file => file.endsWith(".ts"));
    
    /* カテゴリーマップを初期化 */
    for (const category of categoryList) {
        cache.categoryMap[category.name] = [];
    }

    for (const file of files) {
        const name = file.substring(0, file.length - 3);
        logger.debug(`コマンド読込: ${name}.ts`);

        try {
            const cmd = <Command>await import(`./commands/${file}`);
            if (cmd.ignore) {
                logger.debug(`コマンド ${name}.ts はignore設定のため、無視します`);
                continue;
            }

            /* 各カテゴリーのリストにコマンドを追加 */
            for (const category of cmd.categories) {
                cache.categoryMap[category.name].push(cmd.name ? cmd.name : name);
            }

            addCommand(cmd, name);
        } catch (err) {
            logger.error(new CommandLoadError(`コマンド ${name}.ts の読込中にエラーが発生しました`, <Error>err));
        }
    }

    /* 各カテゴリーのリストをソート */
    for (const category of categoryList) {
        cache.categoryMap[category.name] = cache.categoryMap[category.name].sort();
    }
    
    for (const name in cache.commands) {
        logger.debug(`コマンド初期化: ${name}`);
        const cmd = cache.commands[name];
        if (cmd.init) {
            try {
                await cmd.init({client: bot.client, cmd: cmd});
            } catch (err) {
                logger.error(new CommandInitError(`コマンド ${name} の初期化中にエラーが発生しました`, <Error>err));
            }
        }
    }
}

function addCommand(cmd: Command, filename: string) {
    const loaded = {} as LoadedCommand;
    const apicmd = {} as APIApplicationCommand;
    const name = cmd.name ? cmd.name : filename;
    
    loaded.name = name;
    loaded.argMap = {};
    loaded.categories = cmd.categories;

    apicmd.name = name;
    apicmd.dm_permission = !cmd.guildOnly;
    apicmd.nsfw = cmd.nsfw;

    apicmd.options = cmd.options;

    apicmd.description = locfallback(`command.${name}.$description`, config.fallbackLang);
    setLocalizations(apicmd, "description_localizations", `command.${name}.$description`);
    localizeOptions(loaded.argMap, apicmd.options, `command.${name}`);
    
    loaded.discord = apicmd;
    loaded.init = cmd.init;
    loaded.run = cmd.run;

    cache.commands[name] = loaded;
}

function setLocalizations(base: {[key: string]: any}, property: string, key: string) {
    const locales: {[key: string]: string} = {};
    
    for (let lang of langNames) {
        let code = locfallback("langCode", lang);
        locales[code] = locfallback(key, lang);
    }

    base[property] = locales;
}

type SubcommandOption = APIApplicationCommandSubcommandOption | APIApplicationCommandSubcommandGroupOption;
type ChoiceableOption = APIApplicationCommandStringOption | APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption;

function localizeOptions<T extends APIApplicationCommandOption>(argMap: {[key: string]: string}, options: T[], baseKey: string) {
    for (const opt of options) {
        const argName = opt.name;
        const base = `${baseKey}.${argName}`;

        opt.name = locfallback(`${base}.$name`, config.fallbackLang);
        opt.description = locfallback(`${base}.$description`, config.fallbackLang);

        argMap[argName] = opt.name;

        setLocalizations(opt, "name_localizations", `${base}.$name`);
        setLocalizations(opt, "description_localizations", `${base}.$description`);

        if ("options" in opt) {
            const subopt = <SubcommandOption>opt;
            localizeOptions(argMap, <APIApplicationCommandBasicOption[]>subopt.options, base);
        }

        if ("choices" in opt) {
            const chopt = <ChoiceableOption>opt;
            localizeChoices(<APIApplicationCommandOptionChoice[]>chopt.choices, base);
        }
    }
}

function localizeChoices(choices: APIApplicationCommandOptionChoice<any>[], baseKey: string) {
    for (const ch of choices) {
        const argName = ch.value;
        const base = `${baseKey}.${argName}`;

        if (!("name" in ch) || ch.name === "") {
            const chstr = <APIApplicationCommandOptionChoice<string>>ch;
            chstr.name = locfallback(`${base}.${argName}.$name`, config.fallbackLang);
            setLocalizations(ch, "name_localizations", `${base}.$name`);
        }
    }
}

function locfallback(key: string, lang: string): string {
    let value = locstring(key, lang);
    if (value === key) {
        return `error-${crypto.createHash("md5").update(key).digest("hex").substring(0, 6)}`;
    }
    return value;
}

function getAPICommands(): APIApplicationCommand[] {
    const arr: APIApplicationCommand[] = [];
    for (const name in cache.commands) {
        const cmd = cache.commands[name];
        arr.push(cmd.discord);
    }
    return arr;
}

function createRest(): REST {
    return new REST({
        version: "9"
    }).setToken(<string>process.env.BOT_TOKEN);
}

export async function registerProd() {
    const CLIENT_ID: string = <string>bot.client.user?.id;

    try {
        logger.debug("グローバルコマンドを登録します");
        await createRest().put(Routes.applicationCommands(CLIENT_ID), {
            body: getAPICommands()
        })
    } catch (err) {
        logger.error(new CommandRegisterError(`コマンドの登録中にエラーが発生しました`, <Error>err));
    }
    logger.log(`${Object.keys(cache.commands).length}個のコマンドを登録しました`);
}

export async function unregisterProd() {
    const CLIENT_ID: string = <string>bot.client.user?.id;

    try {
        logger.debug("グローバルコマンドを削除します");
        await createRest().put(Routes.applicationCommands(CLIENT_ID), {
            body: []
        })
    } catch (err) {
        logger.error(new CommandRegisterError(`コマンドの削除中にエラーが発生しました`, <Error>err));
    }
    logger.log(`${Object.keys(cache.commands).length}個のコマンドを削除しました`);
}

export async function registerDev() {
    const CLIENT_ID: string = <string>bot.client.user?.id;
    
    for (const guild of config.testGuilds) {
        try {
            logger.debug(`サーバーコマンドを登録します (サーバーID:${guild})`);
            await createRest().put(Routes.applicationGuildCommands(CLIENT_ID, guild), {
                body: getAPICommands()
            })
        } catch (err) {
            logger.error(new CommandRegisterError(`コマンドの登録中にエラーが発生ました (サーバーID:${guild})`, <Error>err));
        }
    }
    logger.log(`${Object.keys(cache.commands).length}個のコマンドを${config.testGuilds.length}個のサーバーに登録しました`);
}

export async function unregisterDev() {
    const CLIENT_ID: string = <string>bot.client.user?.id;
    
    for (const guild of config.testGuilds) {
        try {
            logger.debug(`サーバーコマンドを削除します (サーバーID:${guild})`);
            await createRest().put(Routes.applicationGuildCommands(CLIENT_ID, guild), {
                body: []
            })
        } catch (err) {
            logger.error(new CommandRegisterError(`コマンドの削除中にエラーが発生ました (サーバーID:${guild})`, <Error>err));
        }
    }
    logger.log(`${Object.keys(cache.commands).length}個のコマンドを${config.testGuilds.length}個のサーバーから削除しました`);
}
