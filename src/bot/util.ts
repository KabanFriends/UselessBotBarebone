import log4js from "log4js";
import { ColorResolvable, EmbedBuilder, HexColorString } from "discord.js";
import { locstring } from "../lang/lang";

import config from "../../config/shared.json";

const logger = log4js.getLogger();

export function commandEmbed(cmd: string, lang: string) {
    return new EmbedBuilder()
        .setTitle(locstring(`command.${cmd}.embed.title`, lang))
        .setColor(getEmbedColor())
}

export function getEmbedColor(): ColorResolvable {
    return <HexColorString>config.embedColor;
}

export function isEmpty(val: any | null | undefined): val is null | undefined {
    return val === null || val === undefined;
}

export function removeArrayElement(array: any[], item: any) {
    const index = array.indexOf(item);
    if (index !== -1) {
        removeArrayIndex(array, index);
    }
}

export function removeArrayIndex(array: any[], index: number) {
    array.splice(index, 1);
}
