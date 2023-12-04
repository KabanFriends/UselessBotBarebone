import log4js from "log4js";
import { Command } from "../interface/Command";

const logger = log4js.getLogger();

export = {
    ignore: true, // テンプレートをコピーした後はignore設定を削除
    categories: [],
    options: [],

    async init({client}) {
    },

    async run({interaction, args, client}) {
    }
} as Command;