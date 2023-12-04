export const enum RuntimeMode {
    Production = "PRODUCTION",
    Development = "DEVELOPMENT"
}

export var mode: RuntimeMode = RuntimeMode.Production;
export var screenDebug: Boolean = false;

export function init() {
    // screenを無効化するかどうか
    if (process.argv.includes("noscreen")) {
        screenDebug = true;
    }

    // 稼働モード
    mode = process.env.MODE as RuntimeMode;
}

export function isProduction(): Boolean {
    return mode === RuntimeMode.Production;
}
