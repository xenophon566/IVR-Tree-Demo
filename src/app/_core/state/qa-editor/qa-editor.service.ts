import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

/**
 * editor answer types
 *
 * @export
 * @enum {string}
 */
export const enum EDITOR_TYPE {
    TYPE = `{"Text" : "qa-text", "Image" : "qa-image", "LinkImage" : "qa-image","TextImage" : "qa-image", "Cards" : "qa-card",
    "Audio" : "qa-audio", "File" : "qa-file", "Video" : "qa-video", "MediaCard": "qa-mediaCard",
    "External" : "qa-link", "Json" : "qa-json", "Quote" : "qa-quote",
    "QuickReply" : "qa-reply", "WebViewUrl" : "qa-webview","play":"qa-play"}`,
}

/**
 * editor components
 *
 * @export
 * @enum {number}
 */
export const enum EDITOR_COMPONENT {
    MAX = 5,
}

/**
 * qaEditor service
 *
 * @export
 * @class QaEditorService
 */
@Injectable({
    providedIn: "root",
})
export class QaEditorService {
    constructor() {}

    stateObject = {};

    activitySelected = {};

    qaEditorInfoObject = {};

    replyContentLabelData = {};

    cardLabelData = {};

    robotResult = {};

    valueContentData = {};

    oauthTokenTargetData = {};

    // clone temporary stack for error messages
    cloneCount = 0;
    cloneMsgStack = [];

    // qa-editor components order list
    qaEditorOrderList: object = {};

    /**
     * qa-editor information by rxjs
     *
     * @memberof QaEditorService
     */
    public qaEditorInfoRxjs = new Subject<any>();
    qaEditorInfoRxjs$ = this.qaEditorInfoRxjs.asObservable();

    /**
     * verify state by RxJS
     *
     * @memberof QaEditorService
     */
    public verifyState = new BehaviorSubject<any>([]);
    verifyState$ = this.verifyState.asObservable();

    /**
     * save state by RxJS
     *
     * @memberof QaEditorService
     */
    public isSave = new Subject<any>();
    isSave$ = this.isSave.asObservable();

    /**
     * remove state by RxJS
     *
     * @memberof QaEditorService
     */
    public isRemove = new Subject<any>();
    isRemove$ = this.isRemove.asObservable();

    /**
     * is need verify state by RxJS
     *
     * @memberof QaEditorService
     */
    public isNeedVerify = new BehaviorSubject(false);
    isNeedVerify$ = this.isNeedVerify.asObservable();

    // isRequiredVerify flag
    isRequiredVerify: boolean = false;

    /**
     * is required verify state by RxJS
     *
     * @memberof QaEditorService
     */
    public isRequiredVerifyState = new BehaviorSubject([]);
    isRequiredVerifyState$ = this.isRequiredVerifyState.asObservable();

    /**
     * is need verify state by RxJS
     *
     * @memberof QaEditorService
     */
    public isRequiredTextByPhone = new BehaviorSubject(true);
    isRequiredTextByPhone$ = this.isRequiredTextByPhone.asObservable();

    setIsRequiredTextByPhone(value: boolean) {
        this.isRequiredTextByPhone.next(value);
    }

    /**
     * 是否產生新的單答特殊格式 (Json,外部知識)
     * 讓問答意圖編輯器能夠即時檢查通用滿意度是否衝突
     *
     * @memberof QaEditorService
     */
    public isClickMenu = new BehaviorSubject(false);
    isClickMenu$ = this.isClickMenu.asObservable();

    /**
     * RxJS quoteQAData
     *
     * @memberof QaEditorService
     */
    public quoteQAData = new BehaviorSubject<any>([]);
    quoteQAData$ = this.quoteQAData.asObservable();

    /**
     * set Quote QAData
     *
     * @param {*} value
     * @param {*} id
     * @memberof QaEditorService
     */
    setQuoteQAData(value, id) {
        this.quoteQAData.next([value, id]);
    }

    /**
     * clear Quote QAData
     *
     * @memberof QaEditorService
     */
    clearQuoteQAData() {
        this.quoteQAData.next([]);
    }

    setIsClickMenu(value: any) {
        this.isClickMenu.next(value);
    }

    /**
     * ### 通知最後一個答案格式是否為文字
     *
     * @memberof QaEditorService
     */
    public isTextAtLast = new Subject<any>();
    isTextAtLast$ = this.isTextAtLast.asObservable();

    /**
     * ### 設定通知最後一個答案格式是否為文字
     *
     * @param {boolean} [value=false]
     * @memberof QaEditorService
     */
    setIsTextAtLast(answerObject: any) {
        this.isTextAtLast.next(answerObject);
    }

    /**
     * get quick reply item
     *
     * @param {*} quickReply
     * @param {*} qaEditorArray
     * @param {*} quickReplyItem
     * @returns
     * @memberof QaEditorService
     */
    getQuickReplyItem(quickReply: any, qaEditorArray: any, quickReplyItem: any) {
        quickReply.QuickReply = qaEditorArray[qaEditorArray.length - 1];

        quickReply.QuickReply.quick_reply_items = [];

        quickReplyItem.forEach((element) => {
            delete element.channel;
            delete element.type;
            delete element.componentId;
            quickReply.QuickReply.quick_reply_items.push(element);
        });

        qaEditorArray[qaEditorArray.length - 1] = quickReply;

        return qaEditorArray;
    }

    /**
     * set final answer object
     *
     * @param {*} qaEditorArray
     * @param {*} answerObject
     * @returns
     * @memberof QaEditorService
     */
    setFinalAnsObj(qaEditorArray: any, answerObject: any) {
        const isAllEmpty = qaEditorArray.every(
            (item) =>
                item.type === "Text" &&
                item.version === "v770" &&
                item.text.length === 1 &&
                item.text[0] === "" &&
                !item.params
        );

        if (isAllEmpty) qaEditorArray = [{ text: [""], type: "Text", version: "v770" }];

        if (qaEditorArray.length > 1) {
            answerObject.type = "Multiple";
            answerObject.ans = qaEditorArray;
        } else answerObject = !!qaEditorArray[0] ? qaEditorArray[0] : "";

        answerObject.version = "v770";
        if (answerObject.type === "Json") answerObject = answerObject.content;

        return answerObject;
    }

    /**
     * set final answer
     *
     * @param {string} quickReplyItem
     * @param {any[]} qaEditorArray
     * @param {*} quickReply
     * @param {string} webview
     * @param {string} channel
     * @param {string} robotCommand
     * @returns
     * @memberof QaEditorService
     */
    setFinalAnswer(
        quickReplyItem: string,
        qaEditorArray: any[],
        quickReply: any,
        webview: string,
        channel: string,
        robotCommand: string,
        play: any,
        command: any
    ) {
        // set PLAY answer
        if (!!play && Object.keys(play).length > 0 && qaEditorArray[0].type === "Text")
            qaEditorArray[0].params = typeof play === "object" ? play : JSON.parse(play);

        // set COMMAND answer
        if (!!command && Object.keys(command).length > 0 && qaEditorArray[0].type === "Text") {
            if (!!command.params)
                command.params = typeof command.params === "object" ? command.params : JSON.parse(command.params);
            qaEditorArray[0].command = command;
        }

        // set QUICKREPLY answer
        if (!!quickReplyItem) qaEditorArray = this.getQuickReplyItem(quickReply, qaEditorArray, quickReplyItem);

        // set WEBVIEW answer (MUST after quick reply)
        if (!!webview) {
            const lastAnswer = qaEditorArray[qaEditorArray.length - 1];
            if (!!lastAnswer["QuickReply"]) lastAnswer["QuickReply"].WebViewUrl = webview;
            else lastAnswer.WebViewUrl = webview;
        }

        // set ROBOT result
        if (!!this.robotResult[channel] && !!Object.keys(this.robotResult[channel]).length)
            this.getRobotResult(channel, robotCommand, qaEditorArray);

        return qaEditorArray;
    }

    /**
     * get robot result
     *
     * @param {string} channel
     * @param {*} robotCommand
     * @param {*} qaEditorArray
     * @returns
     * @memberof QaEditorService
     */
    getRobotResult(channel: string, robotCommand: any, qaEditorArray: any) {
        const robotResultObj = this.robotResult[channel];
        if (!!robotResultObj) {
            if (robotResultObj.robotType === "qbi") {
                robotCommand = {
                    robotType: "qbi",
                    action: robotResultObj.action,
                };
            } else if (robotResultObj.robotType === "zenbo") {
                robotCommand = {
                    robotType: "zenbo",
                    emotion: robotResultObj.emotion,
                };
            }

            if (qaEditorArray[qaEditorArray.length - 1].type === "QuickReply") {
                qaEditorArray[qaEditorArray.length - 1].QuickReply.robotCommand = [robotCommand];
                qaEditorArray[qaEditorArray.length - 1].QuickReply.speechContent = robotResultObj.speechContent;
            } else {
                qaEditorArray[qaEditorArray.length - 1].robotCommand = [robotCommand];
                qaEditorArray[qaEditorArray.length - 1].speechContent = robotResultObj.speechContent;
            }

            return robotCommand;
        } else {
            console.error("no robot result error");
            return;
        }
    }

    /**
     * prepare final answer
     *
     * @param {string} quickReplyItem
     * @param {any[]} qaEditorArray
     * @param {*} quickReply
     * @param {string} webview
     * @param {string} robotCommand
     * @param {string} channel
     * @returns
     * @memberof QaEditorService
     */
    prepareFinalAnswer(
        quickReplyItem: string,
        qaEditorArray: any[],
        quickReply: any,
        webview: string,
        robotCommand: string,
        channel: string,
        play: any,
        command: any
    ) {
        qaEditorArray = this.setFinalAnswer(
            quickReplyItem,
            qaEditorArray,
            quickReply,
            webview,
            channel,
            robotCommand,
            play,
            command
        );

        // remove key property
        qaEditorArray.filter((r) => delete r.key);

        // finalAnswerObject
        let finalAnswerObject = JSON.parse(JSON.stringify({}));
        finalAnswerObject = this.setFinalAnsObj(qaEditorArray, finalAnswerObject);
        return { finalAnswerObject, qaEditorArray };
    }

    /**
     * load robot result
     *
     * @param {*} $scope
     * @param {*} lastAnswer
     * @param {*} channel
     * @memberof QaEditorService
     */
    loadRobotResult($scope, lastAnswer: any, channel: any) {
        let robotCommand = [];
        robotCommand =
            lastAnswer.type === "QuickReply"
                ? lastAnswer.QuickReply["robotCommand"] || []
                : lastAnswer["robotCommand"] || [];

        // set robot setting by last answer
        $scope.robotRadio = robotCommand.length > 0 ? robotCommand[0]["robotType"] || "qbi" : "qbi";
        $scope.robotSelect =
            robotCommand.length > 0 ? robotCommand[0]["action"] || robotCommand[0]["emotion"] || undefined : undefined;

        // get robot selection list
        $scope.robotSelectList = $scope.robotRadio === "qbi" ? $scope.qbiSelectList : $scope.zenboSelectList;

        // get last answer for speechContent
        let speechContent = "";
        speechContent =
            lastAnswer.type === "QuickReply"
                ? lastAnswer.QuickReply["speechContent"]
                : lastAnswer["speechContent"] || "";

        $scope.robotTextarea[channel] = speechContent || "";
    }

    /**
     * get qa-menu
     *
     * @param {*} [menuLang=null]
     * @param {*} [menuFilter=[]]
     * @returns
     * @memberof QaEditorService
     */
    getQaMenu(menuLang = null, menuFilter = []) {
        if (!menuLang) return [];

        let qaMenu = [
            { title: menuLang.TEXT.TEXT, icon: "file-text-outline", tag: "qa-text" },
            { title: menuLang.IMAGE.IMAGE, icon: "image-outline", tag: "qa-image" },
            {
                title: menuLang.CARD.CARD,
                icon: "credit-card-outline",
                tag: "qa-card",
            },
            { title: menuLang.AUDIO.AUDIO, icon: "music-outline", tag: "qa-audio" },
            { title: menuLang.FILE.FILE, icon: "file-outline", tag: "qa-file" },
            { title: menuLang.VIDEO.VIDEO, icon: "video-outline", tag: "qa-video" },
            { title: menuLang.LINK.LINK, icon: "link-outline", tag: "qa-link" },
            { title: "Json", icon: "archive-outline", tag: "qa-json" },
            {
                title: menuLang.MEDIA_CARD.MEDIA_CARD,
                icon: "credit-card-outline",
                tag: "qa-mediaCard",
            },
            { title: menuLang.QUOTE.QUOTE_SMARTQA, icon: "archive-outline", tag: "qa-quote" },
        ];
        qaMenu = qaMenu.filter((menu) => !~JSON.stringify(menuFilter).indexOf(menu.tag));

        return qaMenu;
    }

    /**
     * setQaMenuHide
     *
     * @param {string} [channel='']
     * @param {*} [qaMenu=[]]
     * @param {*} [filterObj={}]
     * @return {*}
     * @memberof QaEditorService
     */
    setQaMenuHide(channel = "", qaMenu = [], filterObj = {}) {
        if (!!channel && !!qaMenu.length && !!filterObj[channel]) {
            const menuFilter = filterObj[channel];
            for (const item of menuFilter) {
                for (const i in qaMenu) {
                    if (qaMenu[i].tag === item) qaMenu.splice(+i, 1);
                }
            }
        }

        return qaMenu;
    }

    /**
     * set is need verify
     *
     * @param {boolean} value
     * @memberof QaEditorService
     */
    setIsNeedVerify(value: boolean) {
        this.isRequiredVerifyState.next([]);
        this.isNeedVerify.next(value);
    }

    /**
     * clear is required verify state
     *
     * @memberof QaEditorService
     */
    clearIsRequiredVerifyState() {
        this.isRequiredVerifyState.next([]);
    }

    /**
     * set is required verify state
     *
     * @param {*} value
     * @memberof QaEditorService
     */
    setIsRequiredVerifyState(value: any): void {
        const curState = this.isRequiredVerifyState.getValue();
        let isRequired: boolean = false;
        const curIsRequired: boolean = this.isRequiredVerify;
        curState.push(value);

        curState.forEach((item) => {
            if (Object.values(item)[0]) isRequired = true;
        });

        if (isRequired) {
            this.isRequiredVerify = true;
        } else this.isRequiredVerify = false;

        // if rule changed, need to verify again.
        if (isRequired !== curIsRequired) {
            this.isNeedVerify.next(true);
        }

        this.isRequiredVerifyState.next(curState);
    }

    /**
     * set global
     *
     * @param {*} value
     * @memberof QaEditorService
     */
    setGlobal(value: any): void {
        this.qaEditorInfoRxjs.next(value);
    }

    /**
     * set is save
     *
     * @memberof QaEditorService
     */
    setIsSave(): void {
        this.isSave.next(true);
    }

    /**
     * set is remove
     *
     * @param {string} [channel='web']
     * @param {string} [id='']
     * @memberof QaEditorService
     */
    setIsRemove(channel = "", id = "", type = ""): void {
        this.isRemove.next({ channel, id, type });
    }

    /**
     * set verify state
     *
     * @param {*} value
     * @memberof QaEditorService
     */
    setVerifyState(value: any): void {
        const curData = this.verifyState.getValue();
        let isExist: boolean = false;
        curData.forEach((item) => {
            if (item.id === value.id && item.channel === value.channel) {
                isExist = true;
                item.component = value.component;
                item.channel = value.channel;
                item.state = value.state;
            }
        });
        if (!isExist) curData.push(value);
        this.verifyState.next(curData);
    }

    /**
     * clear verify
     *
     * @memberof QaEditorService
     */
    clearVerify() {
        this.verifyState.next([]);
    }

    public isGoogleAudio = new BehaviorSubject("");
    isGoogleAudio$ = this.isGoogleAudio.asObservable();

    setGoogleAudio(value: string = "") {
        this.isGoogleAudio.next(value);
    }
}
