import log4js from "log4js";
import fs from "fs";

import config from "../../config/shared.json";
import { db } from "../database/database";

const logger = log4js.getLogger();

type LocaleJson = {[key: string]: string | Array<string>};

const langMaps: {[key: string]: LocaleJson} = {};

export const langNames: Array<string> = [];

export async function init() {
    const files = fs.readdirSync("./locales").filter(file => file.endsWith(".json"));
    for (const file of files) {
        const name = file.substring(0, file.length - 5);
        const json = <LocaleJson>await import(`../../locales/${name}.json`);

        langNames.push(name);
        langMaps[name] = json;
    }
}

export function locstring(key: string, lang: string): string {
    let trueLang = config.fallbackLang;
    if (langNames.includes(lang)) {
        trueLang = lang;
    }

    const json = langMaps[trueLang];
    
    if (json.hasOwnProperty(key)) {
        return <string>json[key];
    } else {
        if (trueLang === config.fallbackLang) {
            return key;
        }else {
            return locstring(key, config.fallbackLang);
        }
    }
}

export function locarray(key: string, lang: string): Array<string> {
    let trueLang = config.fallbackLang;
    if (langNames.includes(lang)) {
        trueLang = lang;
    }

    const json = langMaps[trueLang];
    
    if (json.hasOwnProperty(key)) {
        return <Array<string>>json[key]
    }else {
        if (trueLang == config.fallbackLang) {
            return [];
        }else {
            return locarray(key, config.fallbackLang);
        }
    }
}

export function guildlang(id: string | null | undefined): string {
    if (id === null || typeof id === "undefined" || id === "") {
        return config.defaultLang;
    }
    let lang = db.settings.get(id, "lang");
    if (!langNames.includes(lang)) {
        lang = config.defaultLang;
        db.settings.set(id, config.defaultLang, "lang");
    }
    return lang;
}
