import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * ### CHANNEL_NAME => ['Web', 'iOS', 'Android', 'LINE', 'Messenger', 'Phone', 'OK Google', 'Instagram']
 *
 * @export
 * @type {object}
 */
export const GLOBAL = {
    COLOR_CODE: [
        "#546fc6",
        "#91cb74",
        "#fac859",
        "#ee6666",
        "#73c0de",
        "#3ba372",
        "#fc8452",
        "#9a60b4",
        "#e97ccb",
        "#874494",
        "#d9ecfd",
        "#af0369",
        "#e3f921",
        "#12eadb",
        "#173888",
        "#b16969",
        "#ff8000",
        "#1034c7",
        "#acf25a",
        "#66549a",
    ],
    USER_ROLE: {
        "00000000-0000-0000-1004-000000000002": "administrator",
        "161e5bdb-ff50-070a-3d7e-8c859041685c": "cbeAdministrator",
        "164f8aa2-3960-0a73-1f12-5254006745da": "cbeAdmin",
        "177f1914-c150-01fe-3c9d-00155d41ce93": "cbeSupervisor",
        "167164c9-7860-04dd-1cc8-5254006745da": "cbeKnowledgeEditor",
        "177f1957-2640-01fe-3c9d-00155d41ce93": "cbeReportUser",
        "177f1946-8060-01fe-3c9d-00155d41ce93": "cbeViewer",
    },
    ROLE_BASED: {
        ADMINISTRATOR: ["administrator", "cbeAdministrator"],
        ADMIN: ["administrator", "cbeAdministrator", "cbeAdmin"],
        SUPERVISOR: ["administrator", "cbeAdministrator", "cbeAdmin", "cbeSupervisor"],
        KNOWLEDGE: ["administrator", "cbeAdministrator", "cbeAdmin", "cbeSupervisor", "cbeKnowledgeEditor"],
        REPORT: [
            "administrator",
            "cbeAdministrator",
            "cbeAdmin",
            "cbeSupervisor",
            "cbeKnowledgeEditor",
            "cbeReportUser",
        ],
    },
    CHANNEL_NAME: {
        web: "Web",
        ios: "iOS APP",
        android: "Android APP",
        line: "LINE",
        messenger: "Messenger",
        phone: "Phone",
        google: "OK Google",
        instagram: "Instagram",
    },
    CHANNEL_ORDER:
        "web,web_Activity,ios,ios_Activity,android,android_Activity,line,line_Activity,messenger,messenger_Activity,phone,phone_Activity,google,google_Activity,instagram,instagram_Activity",
    RESULT_MESSAGE: "[CBE] ",
};

/**
 * ### 動態全域樣式
 *
 * @export
 * @type {object}
 */
export const GLOBAL_STYLES = {
    CHART_HEIGHT: 480,
    CHART_CANVAS_HEIGHT: 500,
    LEGEND_HEIGHT: 34,
    OFFSET_HEIGHT: 40,
    FONT: {
        COLOR: "#000000",
        FAMILY: `cwTeXYen, sourcehansans-tc, 微軟正黑體, "Noto Sans TC", "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif`,
        SIZE_20: "1.25rem",
        SIZE_16: "1rem",
        SIZE_14: "0.875rem",
        SIZE_13: "0.8125rem",
        SIZE_12: "0.75rem",
        SIZE_10: "0.625rem",
        WEIGHT_NORMAL: "400",
        WEIGHT_LIGHT_BOLD: "500",
        WEIGHT_BOLD: "700",
    },
};

/**
 * ### Enum SET_TIMEOUT
 *
 * - MOMENT = 0,
 * - EXTREMELY = 100,
 * - NORMAL = 500,
 * - NORMAL_SLOW = 1000,
 * - SLOW = 2000,
 * - REATTACH = 150,
 *
 * @export
 * @enum {number}
 */
export const enum SET_TIMEOUT {
    MOMENT = 0,
    EXTREMELY = 100,
    NORMAL = 500,
    NORMAL_SLOW = 1000,
    SLOW = 2000,
    REATTACH = 150,
}

/**
 * ### Global Service
 *
 * @export
 * @class GlobalService
 */
@Injectable({
    providedIn: "root",
})
export class GlobalService {
    constructor() {}

    /**
     * ### global language object
     *
     * @memberof GlobalService
     */
    globalLangObj = {};

    /**
     * ### global by rxjs
     *
     * @memberof GlobalService
     */
    public globalRxjs = new BehaviorSubject<any>({});
    globalRxjs$ = this.globalRxjs.asObservable();

    /**
     * ### set Global
     *
     * @param {*} value
     * @memberof GlobalService
     */
    setGlobal(value: any): void {
        this.globalRxjs.next(value);
    }

    /**
     * ### curBotRxjs
     *
     * @memberof GlobalService
     */
    public curBotRxjs = new BehaviorSubject<any>({});
    curBotRxjs$ = this.curBotRxjs.asObservable();

    /**
     * ### setCurBot
     *
     * @param {*} value
     * @memberof GlobalService
     */
    setCurBot(value: any): void {
        this.curBotRxjs.next(value);
    }
}
