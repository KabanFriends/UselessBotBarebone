import Enmap from "enmap";

import config from "../../config/shared.json";

export const db: {[key: string]: Enmap} = {
    settings: new Enmap({
        name: "settings",
        fetchAll: false,
        autoFetch: true,
        cloneLevel: "deep",
        autoEnsure: {
            lang: config.defaultLang
        }
    })
}

export function init() {
        db.settings.fetchEverything();
}