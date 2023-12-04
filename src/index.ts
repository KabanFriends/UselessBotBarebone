import log4js from "log4js";
import schedule from "node-schedule";
import * as dotenv from "dotenv";
import * as properties from "./runtime/properties";
import * as logging from "./logging/logging";
import * as screen from "./screen/screen";
import * as bot from "./bot/bot";

(async () => {
    /* 優先度の高い設定 */
    dotenv.config(); // .envファイルを読み込む
    properties.init(); // ランタイム設定
    await logging.init(); // ログ環境構築
    if (!properties.screenDebug) await screen.init(); // Screen構築

    const logger = log4js.getLogger();
    
    /* 起動タイトル表示 */
    let title = `UselessBot Sample v${process.env.npm_package_version}`;
    let subtitle = "by KabanFriends";

    let spaces = Math.floor((title.length - subtitle.length) / 2);
    let remspaces = Math.ceil((title.length - subtitle.length) / 2);

    logger.info("#".repeat(title.length + 4));
    logger.info(`# ${title} #`);
    logger.info(`# ${" ".repeat(spaces)}${subtitle}${" ".repeat(remspaces)} #`);
    logger.info("#".repeat(title.length + 4));

    logger.info(`稼働モード: ${properties.mode}`);

    screen.initCommands(); // コンソールコマンド読込
    bot.init(); // Botクライアント起動

    /* 自動再起動 */
    schedule.scheduleJob({hour: 5, minute: 0, second: 0, tz: "Asia/Tokyo"}, async () => {
        logger.log("BOTの自動再起動を行います。");
        await bot.shutdown();
    });
})();
