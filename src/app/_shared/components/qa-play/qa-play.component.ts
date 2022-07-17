import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { HttpService, SET_TIMEOUT, VerifyService } from "@core/services";
import { EditorService } from "@core/services/editor.service";
import { GreetingEditorService, QaEditorService, QaPlayService, SmartQaEditorService } from "@core/state";
import { LanguageService, PostMessageService } from "@core/utils";
import { environment } from "@env/environment";

@Component({
    selector: "cbe-qa-play",
    templateUrl: "./qa-play.component.html",
    styleUrls: ["./qa-play.component.scss"],
})
export class QaPlayComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private qaPlayService: QaPlayService,
        private qaEditorService: QaEditorService,
        private editorService: EditorService,
        private postMessageService: PostMessageService,
        private changeDetectorRef: ChangeDetectorRef,
        private languageService: LanguageService,
        private verifyService: VerifyService,
        private smartQaEditorService: SmartQaEditorService,
        private httpService: HttpService,
        private greetingEditorService: GreetingEditorService
    ) {
        this.languageService.language$.subscribe((resp) => {
            this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        });
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    /**
     * i18n
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    QA_EDITOR: any;

    /**
     * 來源資料
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    @Input() data: any;

    /**
     * 是否有資料載入
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    isLoad: any;

    /**
     * 元件 Id
     *
     * @memberof QaPlayComponent
     */
    id = Math.random().toString(36).substring(7);

    /**
     * 所有 qa-play 元件的資料
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    qaPlayObj: any = {};

    /**
     * isSave 訂閱
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    subIsSave: any;

    /**
     * 智能問題選擇
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    subReplyQAData: any;

    /**
     * qaPlayState 訂閱
     *
     * @type {*}
     * @memberof QaPlayComponent
     */
    subQaPlayState: any;

    /**
     * 播放類型 ( 0:固定音檔 / 7:合成語音 )
     *
     * @memberof QaPlayComponent
     */
    playtype = "7";

    /**
     * 是否可以按鍵打斷 ( 0:不能打斷 / 1:可以打斷，默認清空 buffer / 2:可以打斷不清空buffer )
     *
     * @memberof QaPlayComponent
     */
    ini = "0";

    /**
     * 指定打斷按鍵 ( 若未設定，任意按鍵皆可以打斷 )
     *
     * @memberof QaPlayComponent
     */
    bargekey = "";

    /**
     * 是否收碼或識別 ( true:收碼或識別 / false:只是放音 )
     *
     * @memberof QaPlayComponent
     */
    getdigit = "false";

    /**
     * 收集類型 ( 0:只收碼 / 1:只收 asr / 2:收號並收 asr )
     *
     * @memberof QaPlayComponent
     */
    collecttype = "0";

    /**
     * 文字資源 ( 檢查如果 dtmf 有值則會去與觸發文字做比對，若比對成功將轉換文字後送給 Gateway )
     *
     * @memberof QaPlayComponent
     */
    dtmfstring = [];

    /**
     * 收碼最小值
     *
     * @memberof QaPlayComponent
     */
    min = "1";

    /**
     * 收碼最大值
     *
     * @memberof QaPlayComponent
     */
    max = "1";

    /**
     * 終止鍵 ( 0-9、*、# )
     *
     * @memberof QaPlayComponent
     */
    end = "";

    /**
     * 取消鍵 ( 0-9、*、# )
     *
     * @memberof QaPlayComponent
     */
    cel = "";

    /**
     * 啟用接續句
     *
     * @memberof QaPlayComponent
     */
    faq = false;

    /**
     * 語音辨識設定
     * 0 先放音，等放音完成後開始 ASR
     * 1 放音和 ASR 同時開始，ASR 有識別結果時打斷放音
     * 2 放音和 ASR 同時開始，ASR 開始識別時打斷放音，且有 ASR 識別結果或者放音結束後，有 ASR 開始識別則等待識別結果返回，
     *    否則等待 ASR 識別超時後返回，期間若 ASR 有開始識別則等待識別結果後返回。
     *  3 放音和 ASR 同時開始，ASR 不打斷放音有識別結果就發送, 如果 asrtimeout 為 0，且沒有識別開始， 放音结束就立刻發送 408
     *
     * @memberof QaPlayComponent
     */
    asrini = "0";

    /**
     * 背景音 ( interval 的單位：秒 )
     * {
     *      "list":[{"interval":2,"music":"a.wav"},{"interval":3,"music":"b.wav"}]
     *  }
     *  依照設定的序列，每次 timer 時間到 (超時時間依照 interval 設定的時間)，會再次設定下一次的時間和音檔。
     *  註：第一次的 timer 設定也是讀取第一組元素設定值，發送給 Gateway 的 request 的總 timeout 時間。依照此設定的每次 interval 的時間加總
     *
     * @memberof QaPlayComponent
     */
    intervallist = [];

    /**
     * 背景音樂後送問題
     *
     * @memberof QaPlayComponent
     */
    commandq = "";
    /**
     * 背景音樂後送問題 UI 顯示
     *
     * @memberof QaPlayComponent
     */
    commandqName = "";

    /**
     * 背景音樂超時問題 ( 當 timeout 後則以此欄位當 content 發送 sendMessage 給 Gateway。 )
     *
     * @memberof QaPlayComponent
     */
    timeoutq = "";
    /**
     * 背景音樂超時問題 UI 顯示
     *
     * @memberof QaPlayComponent
     */
    timeoutqName = "";

    /**
     * 轉接參數 ( 目標號碼 )
     *
     * @memberof QaPlayComponent
     */
    dest = "";

    /**
     * 轉接參數 ( 隨路數據 )
     * 目前功能尚未齊全，暫不開放
     *
     * @memberof QaPlayComponent
     */
    // aai = '';

    /**
     * 錄音參數 (錄音檔案名稱)
     *
     * @memberof QaPlayComponent
     */
    filename = "";

    /**
     * 錄音參數 ( 0-9、#、*(ANY 表示任意键) )
     *
     * @memberof QaPlayComponent
     */
    termkey = "ANY";

    /**
     * 指令，預設轉接服務
     *
     * @memberof QaPlayComponent
     */
    commandType = "";

    /**
     * 是否按下新增指令
     *
     * @type {false}
     * @memberof QaPlayComponent
     */
    isCommandCreated: boolean = false;

    /**
     * 按鍵
     *
     * @memberof QaPlayComponent
     */
    dtmfKey = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"];

    /**
     * dtmfstring 最大數量
     *
     * @type {number}
     * @memberof QaPlayComponent
     */
    maxDtmfString: number = 9;

    /**
     * 背景音最大數量
     *
     * @type {number}
     * @memberof QaPlayComponent
     */
    maxIntervallist: number = 10;

    /**
     * 辨識模型
     *
     * @type {string}
     * @memberof QaPlayComponent
     */
    domainID: string = "";

    initVerifyState: any = { errMsg: "", state: true };

    verifyState: any = {
        dest: this.initVerifyState,
        filename: this.initVerifyState,
        termkey: this.initVerifyState,
        // aai: this.initVerifyState,
        timeoutq: this.initVerifyState,
        commandq: this.initVerifyState,
        min: this.initVerifyState,
        max: this.initVerifyState,
        intervallist: this.initVerifyState,
        domainID: this.initVerifyState,
    };

    verifyObj = {
        dest: ["maxLength,20", "isRequired"],
        // aai: ['maxLength,512'],
        filename: ["maxLength,20", "isRequired"],
        termkey: ["isRequired"],
        timeoutq: ["maxLength,100", "isRequired"],
        commandq: ["maxLength,100", "isRequired"],
        min: [],
        max: [],
        domainID: ["maxLength,200"],
    };
    /**
     * 啟用背景音
     *
     * @memberof QaPlayComponent
     */
    enableIntervalList = false;

    /**
     * 監聽啟用背景音
     *
     * @param {boolean} checked
     * @memberof QaPlayComponent
     */
    toggleEnableIntervalList(checked: boolean) {
        if (!!checked) {
            this.timeoutq = "";
            this.timeoutqName = "";
            this.commandq = "";
            this.commandqName = "";
            this.playtype = "7";
            this.intervallist = [];
            this.qaEditorService.setIsRequiredTextByPhone(false);
        } else {
            this.qaEditorService.setIsRequiredTextByPhone(true);
        }
        this.enableIntervalList = checked;
    }

    ngOnInit(): void {
        this.qaEditorService.setIsRequiredTextByPhone(true);
        this.subQaPlayState = this.qaPlayService.qaPlayState$.subscribe((resp) => {
            this.qaPlayObj = resp.data;
        });

        this.subIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.doVerify();
        });

        if (this.data.openEditor === "greeting") {
            this.subReplyQAData = this.greetingEditorService.replyQAData$.subscribe((resp) => {
                if (resp.length > 0) this.setQACode(resp[0], resp[1]);
            });
        } else {
            this.subReplyQAData = this.smartQaEditorService.replyQAData$.subscribe((resp) => {
                if (resp.length > 0) this.setQACode(resp[0], resp[1]);
            });
        }

        this.isLoad = this.data.loadData ? true : false;
    }

    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.subQaPlayState) this.subQaPlayState.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subReplyQAData) this.subReplyQAData.unsubscribe();
    }

    /**
     * 將資料載入元件內
     *
     * @memberof QaPlayComponent
     */
    appendToComponent() {
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        if (!!this.data.loadData) {
            this.changeDetectorRef.detach();
            this.convertData("DBtoUI");
            // resolve from ngAfterViewChecked issue
            setTimeout(() => {
                this.changeDetectorRef.reattach();
            }, SET_TIMEOUT.REATTACH);
        }
        if (isCloneAction) {
            this.qaEditorService.cloneCount--;

            if (!this.qaEditorService.cloneCount) {
                this.postMessageService.postMessage("custom", {
                    type: "loaderHide",
                });

                if (!!this.qaEditorService.cloneMsgStack.length) this.editorService.showCbeAlert(this);
                this.qaEditorService.cloneCount = 0;
                this.qaEditorService.cloneMsgStack = [];
            }
        }
        this.setResultState();
    }

    /**
     * 監聽下拉選單值 ( getdigit、ini、collecttype )
     *
     * @memberof QaPlayComponent
     */
    handleSelectValue(field, $event) {
        if (!!field) this[field] = $event;
        switch (field) {
            case "getdigit":
                if ($event === "false") {
                    this.dtmfstring = [];
                    this.min = "1";
                    this.max = "1";
                    this.end = "";
                    this.cel = "";
                    this.faq = false;
                    this.asrini = "0";
                    this.intervallist = [];
                    this.commandq = "";
                    this.timeoutq = "";
                    this.collecttype = "0";
                } else {
                    this.enableIntervalList = false;
                    this.qaEditorService.setIsRequiredTextByPhone(true);
                }
                break;
            case "ini":
                if ($event === "0") this.bargekey = "";
                break;
            case "collecttype":
                if ($event === "0") {
                    this.asrini = "0";
                } else if ($event === "1") {
                    this.min = "1";
                    this.max = "1";
                }
                break;
        }
    }

    /**
     * 驗證
     *
     * @memberof QaPlayComponent
     */
    doVerify() {
        let result: boolean = true;
        if (this.dtmfstring.length > 0) this.collapseBtn("dtmfstring");
        if (this.intervallist.length > 0) this.collapseBtn("intervallist");
        this.verifyState = {
            dest: this.initVerifyState,
            filename: this.initVerifyState,
            termkey: this.initVerifyState,
            // aai: this.initVerifyState,
            timeoutq: this.initVerifyState,
            commandq: this.initVerifyState,
            min: this.initVerifyState,
            max: this.initVerifyState,
            intervallist: this.initVerifyState,
        };

        if (this.dtmfstring.length > 0) {
            this.dtmfstring.forEach((item) => {
                item.keyErr = this.verifyService.verify(item.key, ["isRequired"]);
                item.valueErr = this.verifyService.verify(item.value, ["isRequired"]);
                if (!!item.key && (item.key.length > 20 || (item.key.length > 0 && !item.key.match(/^[0-9\*\#]+$/)))) {
                    item.keyErr = {
                        errMsg: this.QA_EDITOR?.PLAY?.PH_DTMF,
                        state: false,
                    };
                }
                if (!item.keyErr.state) result = false;
                if (!item.valueErr.state) result = false;
            });
        }
        if (!!this.enableIntervalList) {
            if (this.intervallist.length > 0) {
                this.intervallist.forEach((item) => {
                    item.intervalErr = this.verifyService.verify(item.interval, ["numberRange,1,300", "isRequired"]);
                    item.musicErr = this.verifyService.verify(item.music, ["isRequired"]);
                    if (item.intervalErr.state === false || item.musicErr.state === false) result = false;
                    if (
                        !!item.interval &&
                        item.interval.length > 0 &&
                        (!item.interval.match(/^[0-9]+$/) || parseInt(item.interval, 10) === 0)
                    ) {
                        item.intervalErr = {
                            errMsg: this.QA_EDITOR?.PLAY?.PH_INTERVAL,
                            state: false,
                        };
                        result = false;
                    }
                });
            } else {
                this.verifyState.intervallist = {
                    errMsg: this.QA_EDITOR?.PLAY?.ATLEASTE_ONE_MUSIC,
                    state: false,
                };
                result = false;
            }
        }

        const ignoreKey = [];

        if (!!this.isCommandCreated) {
            switch (this.commandType) {
                case "transfer":
                    ignoreKey.push("termkey");
                    ignoreKey.push("filename");
                    break;
                case "record":
                    // ignoreKey.push('aai');
                    ignoreKey.push("dest");
                    break;
                case "releasecall":
                    ignoreKey.push("termkey");
                    ignoreKey.push("filename");
                    // ignoreKey.push('aai');
                    ignoreKey.push("dest");
                    break;
                default:
                    break;
            }
        } else {
            ignoreKey.push("termkey");
            ignoreKey.push("filename");
            // ignoreKey.push('aai');
            ignoreKey.push("dest");
        }

        if (!this.enableIntervalList) {
            ignoreKey.push("commandq");
            ignoreKey.push("timeoutq");
        }

        if (!(this.getdigit === "true" && (this.collecttype === "0" || this.collecttype === "2"))) {
            ignoreKey.push("min");
            ignoreKey.push("max");
        } else {
            if (this.min.trim().length > 0 || this.max.trim().length > 0) {
                const minInt = parseInt(this.min, 10);
                const maxInt = parseInt(this.max, 10);

                // 必填
                if (!this.min && this.min !== "0")
                    this.verifyState.min = { errMsg: this.QA_EDITOR?.PLAY?.ERROR_REQUIRED, state: false };

                if (!this.max && this.max !== "0")
                    this.verifyState.max = { errMsg: this.QA_EDITOR?.PLAY?.ERROR_REQUIRED, state: false };

                // 最大值不能小於最小值
                if (minInt > 0 && maxInt > 0) {
                    if (minInt <= maxInt) {
                        this.verifyState.max = this.initVerifyState;
                        this.verifyState.min = this.initVerifyState;
                    } else {
                        this.verifyState.min = {
                            errMsg: this.QA_EDITOR?.COMMON?.MAX_HAS_BIGGER_THAN_MIN,
                            state: false,
                        };
                        this.verifyState.max = {
                            errMsg: this.QA_EDITOR?.COMMON?.MAX_HAS_BIGGER_THAN_MIN,
                            state: false,
                        };
                    }
                }

                // 介於
                if (minInt > 0) {
                    this.verifyState.min = !!this.verifyService.verify(this.min, ["numberRange,1,20"])["state"]
                        ? this.verifyState.min
                        : this.verifyService.verify(this.min, ["numberRange,1,20"]);
                }

                if (maxInt > 0) {
                    this.verifyState.max = !!this.verifyService.verify(this.max, ["numberRange,1,20"])["state"]
                        ? this.verifyState.max
                        : this.verifyService.verify(this.max, ["numberRange,1,20"]);
                }

                // 此欄位僅能輸入正整數
                if (!!this.min && (!this.min.match(/^[0-9]*$/) || this.min === "0")) {
                    this.verifyState.min = {
                        errMsg: this.QA_EDITOR?.PLAY?.PH_INT,
                        state: false,
                    };
                }

                if (!!this.max && (!this.max.match(/^[0-9]*$/) || this.max === "0")) {
                    this.verifyState.max = {
                        errMsg: this.QA_EDITOR?.PLAY?.PH_INT,
                        state: false,
                    };
                }
                ignoreKey.push("min");
                ignoreKey.push("max");
            }
        }

        if (this.getdigit === "false") {
            ignoreKey.push("collecttype");
        }

        for (const key in this.verifyObj) {
            if (!~ignoreKey.indexOf(key))
                this.verifyState[key] = this.verifyService.verify(this[key], this.verifyObj[key]);
        }

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });

        console.log("this.verifyState:", this.verifyState);

        this.qaEditorService.setVerifyState({
            id: this.data.id + "_play",
            state: result,
            channel: this.data.channel,
            component: "qa-play - play",
        });
    }

    /**
     * 轉換格式
     *
     * @param {*} mode UItoDB or DBtoUI
     * @return {*}
     * @memberof QaPlayComponent
     */
    convertData(mode) {
        switch (mode) {
            case "UItoDB":
                const play = {
                    playtype: parseInt(this.playtype, 10),
                    ini: parseInt(this.ini, 10),
                    getdigit: this.getdigit === "true" ? true : false,
                    domainID: this.domainID,
                };
                const end = this.end.trim();
                const cel = this.cel.trim();
                const keyReg = /[0-9]|\*|\#/;
                if (end.length === 1 && keyReg.test(end)) play["end"] = end;
                // 取消鍵
                // if (cel.length === 1 && keyReg.test(cel)) play['cel'] = cel;
                if (!!this.enableIntervalList) {
                    const intervallist = {
                        list: [],
                    };
                    this.intervallist.forEach((item) => {
                        if (item.interval?.toString().trim().length > 0 && item.music?.trim().length > 0) {
                            const row = { interval: parseInt(item.interval, 10), music: item.music };
                            intervallist.list.push(row);
                        }
                    });
                    if (intervallist.list.length > 0) play["intervallist"] = intervallist;
                    if (this.commandq?.length > 0) play["commandq"] = this.commandq;
                    if (this.timeoutq?.length > 0) play["timeoutq"] = this.timeoutq;
                }
                if (this.ini !== "0" && this.bargekey !== "") play["bargekey"] = this.bargekey;
                play["faq"] = this.faq;
                if (this.getdigit === "true") {
                    // 有收音或語音辨識
                    play["collecttype"] = parseInt(this.collecttype, 10);

                    // 有語音辨識功能
                    if (this.collecttype !== "0") play["asrini"] = parseInt(this.asrini, 10);

                    // 有收碼功能
                    if (
                        this.collecttype === "0" ||
                        (this.collecttype === "2" && this.max.length > 0 && this.min.length > 0)
                    ) {
                        play["max"] = parseInt(this.max, 10);
                        play["min"] = parseInt(this.min, 10);
                    }

                    // 收碼 / 收碼並語音辨識，組成 dtmfstring 格式
                    if (this.collecttype === "2" || this.collecttype === "0") {
                        const dtmfstring = {};
                        this.dtmfstring.forEach((item) => {
                            if (item.key?.trim().length > 0 && item.value?.trim().length > 0)
                                dtmfstring[item.key] = item.value;
                        });
                        if (Object.keys(dtmfstring).length > 0) play["dtmfstring"] = dtmfstring;
                    }
                }
                // 指令
                const command = {};
                if (!!this.isCommandCreated && this.data.openEditor !== "greeting") {
                    command["name"] = this.commandType;
                    const commandParams = {};
                    switch (this.commandType) {
                        case "transfer":
                            commandParams["dest"] = this.dest;
                            // if (this.aai.trim().length > 0) commandParams['aai'] = this.aai.trim();
                            break;
                        case "record":
                            commandParams["filename"] = this.filename;
                            commandParams["termkey"] = this.termkey;
                    }
                    if (command["name"] !== "releasecall") command["params"] = commandParams;
                }

                const result = {
                    params: play,
                    command,
                };
                return result;
            case "DBtoUI":
                const params = this.data?.loadData?.params || "";
                if (!!this.data?.loadData?.params && Object.keys(params).length !== 0) {
                    this.getdigit = params.getdigit?.toString() || "false";
                    this.playtype = params.playtype?.toString() || "7";
                    this.ini = params.ini?.toString() || "0";
                    this.domainID = params.domainID?.toString() || "";
                    if (this.getdigit === "true") this.collecttype = params.collecttype?.toString() || "0";
                    if (this.ini !== "0") this.bargekey = params.bargekey || "";
                    if (this.getdigit === "true" && (this.collecttype === "0" || this.collecttype === "2")) {
                        this.min = params.min?.toString() || "";
                        this.max = params.max?.toString() || "";
                    }

                    this.faq = params.faq || false;
                    this.end = params.end || "";
                    // 取消鍵
                    // this.cel = params.cel || '';
                    if (this.getdigit === "true" && this.collecttype !== "0")
                        this.asrini = params.asrini?.toString() || "0";

                    this.dtmfstring = [];
                    if (!!params.dtmfstring && Object.keys(params.dtmfstring).length > 0) {
                        for (const key in params.dtmfstring) {
                            let name = params.dtmfstring[key] || "";
                            try {
                                name = JSON.parse(params.dtmfstring[key])?.name || "";
                            } catch (error) {}
                            const rowDtmfString = {
                                isOpen: false,
                                key,
                                value: params.dtmfstring[key],
                                id: Math.random().toString(36).substring(7),
                                name,
                                keyErr: this.initVerifyState,
                                valueErr: this.initVerifyState,
                            };
                            this.dtmfstring.push(rowDtmfString);
                        }
                    }

                    this.intervallist = params.intervallist?.list || [];
                    this.intervallist = this.intervallist.map((item) => {
                        item.isOpen = false;
                        item.intervalErr = this.initVerifyState;
                        item.musicErr = this.initVerifyState;
                        return item;
                    });
                    if (this.intervallist.length > 0) {
                        this.qaEditorService.setIsRequiredTextByPhone(false);
                        this.commandq = params.commandq || "";
                        this.commandqName = JSON.parse(params.commandq).name || "";
                        this.timeoutq = params.timeoutq || "";
                        this.timeoutqName = JSON.parse(params.timeoutq).name || "";
                        this.enableIntervalList = true;
                    }
                }
                // 指令
                const uiCommand = this.data?.loadData?.command || "";
                if (!!uiCommand && Object.keys(uiCommand).length !== 0) {
                    this.isCommandCreated = true;
                    this.commandType = uiCommand.name;
                    switch (uiCommand.name) {
                        case "transfer":
                            // this.aai = uiCommand.params?.aai || '';
                            this.dest = uiCommand.params?.dest || "";
                            break;
                        case "record":
                            this.filename = uiCommand.params?.filename || "";
                            this.termkey = uiCommand.params?.termkey || "";
                            break;
                        default:
                            break;
                    }
                }
                break;
        }
    }

    /**
     * openSmartQAList
     *
     * @param {*} item
     * @memberof CardContentComponent
     */
    async openSmartQAList(item) {
        if (!~environment.env.indexOf("stage")) {
            let res;
            switch (item.toString()) {
                case "commandq":
                    res = await this.httpService.httpGET(
                        "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/getCommandQData"
                    );
                    break;
                case "timeoutq":
                    res = await this.httpService.httpGET(
                        "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/getTimeoutQData"
                    );
                    break;
                default:
                    res = await this.httpService.httpGET(
                        "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/getReplyQAData"
                    );
                    break;
            }
            this.setQACode(res[0], res[1], true);
        } else {
            const id = typeof item === "string" ? item : item.id;
            this.postMessageService.postMessage("custom", {
                type: "openSmartQAList",
                id,
                page:
                    this.data.openEditor === "greeting"
                        ? "greetingIFrame"
                        : localStorage.getItem("botType") === "qbipro"
                        ? "qaProIFrame"
                        : "icrIFrame",
            });
        }
    }

    /**
     * setQACode
     *
     * @param {*} value
     * @param {*} id
     * @memberof CardContentComponent
     */
    setQACode(value, id, isMock?) {
        // send Old CBE callback data here to append to UI.
        const data = Object.assign({}, value);
        // 補上指令必要參數
        data.type = "QA";
        if (id === "commandq" || id === "timeoutq") {
            this[id + "Name"] = value.name;
            this[id] = JSON.stringify(data);
        } else {
            this.dtmfstring.forEach((item) => {
                if (!!isMock) {
                    item.name = value.name;
                    item.value = JSON.stringify(data);
                } else {
                    if (item.id === id) {
                        item.name = value.name;
                        item.value = JSON.stringify(data);
                    }
                }
            });
        }

        this.smartQaEditorService.clearReplyQAData();
    }

    /**
     * 組成結果格式
     *
     * @memberof QaPlayComponent
     */
    setResultState() {
        const channel = this.data.channel || "";
        if (!!channel && !!~channel.indexOf("phone")) {
            const paramsResult = this.convertData("UItoDB");
            const playResultObj = {
                channel,
                type: "play",
                params: paramsResult.params,
                version: "v770",
            };

            if (Object.keys(paramsResult.command).length > 0) playResultObj["command"] = paramsResult.command;
            const playResult = Object.assign(this.qaPlayObj.result || {}, { [this.data.id]: playResultObj }, {}) || {};

            if (!!Object.keys(playResult).length) {
                this.qaPlayService.setState({
                    data: { result: playResult },
                });
            }
        }
    }

    /**
     * 刪除指令按鈕
     *
     * @memberof QaPlayComponent
     */
    removeCommandBtn() {
        this.isCommandCreated = false;
        this.commandType = "";
        this.dest = "";
        // this.aai = '';
        this.filename = "";
        this.termkey = "";
        if (!!this.qaPlayObj.result && !!this.qaPlayObj.result[this.data.id])
            delete this.qaPlayObj.result[this.data.id].command;
    }

    /**
     * 新增按鈕 ( dtmfstring / 背景音 / 指令 )
     *
     * @param {*} type
     * @memberof QaPlayComponent
     */
    createBtn(type) {
        switch (type) {
            case "dtmfstring":
                this.dtmfstring.push({
                    key: "",
                    value: "",
                    name: "",
                    isOpen: true,
                    id: Math.random().toString(36).substring(7),
                    keyErr: this.initVerifyState,
                    valueErr: this.initVerifyState,
                });
                break;
            case "intervallist":
                this.intervallist.push({
                    interval: "",
                    music: "",
                    isOpen: true,
                    intervalErr: this.initVerifyState,
                    musicErr: this.initVerifyState,
                });
                break;
            case "command":
                this.commandType = "transfer";
                this.dest = "";
                // this.aai = '';
                this.isCommandCreated = true;
                break;
            default:
                break;
        }
    }

    /**
     * 收合按鈕 ( dtmfstring / 背景音)
     *
     * @param {*} type
     * @param {*} index
     * @memberof QaPlayComponent
     */
    collapseBtn(type, index?) {
        // index 未帶入，代表全部關閉
        switch (type) {
            case "dtmfstring":
                if (!!index || index === 0) {
                    if (
                        this.dtmfstring[index]?.key?.trim().length === 0 &&
                        this.dtmfstring[index]?.value?.trim().length === 0
                    )
                        this.dtmfstring.splice(index, 1);
                    else this.dtmfstring[index].isOpen = !this.dtmfstring[index].isOpen;
                } else {
                    const splicIndex = [];
                    this.dtmfstring = this.dtmfstring.map((item, idx) => {
                        if (item?.key?.trim().length === 0 && item?.value?.trim().length === 0) splicIndex.push(idx);
                        else item.isOpen = false;
                        return item;
                    });
                    splicIndex.reverse().forEach((idx) => {
                        this.dtmfstring.splice(idx, 1);
                    });
                }
                break;
            case "intervallist":
                if (!!index || index === 0) {
                    if (
                        this.intervallist[index]?.music?.trim().length === 0 &&
                        this.intervallist[index]?.interval?.trim().length === 0
                    )
                        this.intervallist.splice(index, 1);
                    else this.intervallist[index].isOpen = !this.intervallist[index].isOpen;
                } else {
                    const splicIndex = [];
                    this.intervallist = this.intervallist.map((item, idx) => {
                        if (item?.music?.trim().length === 0 && item?.interval?.trim().length === 0)
                            splicIndex.push(idx);
                        else item.isOpen = false;
                        return item;
                    });
                    splicIndex.reverse().forEach((idx) => {
                        this.intervallist.splice(idx, 1);
                    });
                }
                break;
            default:
                break;
        }
    }

    /**
     * 刪除按鈕 (dtmfstring / 背景音)
     *
     * @param {*} type
     * @param {*} index
     * @memberof QaPlayComponent
     */
    removeBtn(type, index) {
        switch (type) {
            case "dtmfstring":
                this.dtmfstring.splice(index, 1);
                break;
            case "intervallist":
                this.intervallist.splice(index, 1);
                break;
            default:
                break;
        }
    }

    /**
     * 監聽輸入欄位 (dtmfstring / 背景音)
     *
     * @param {*} field
     * @param {*} index
     * @param {*} $event
     * @memberof QaPlayComponent
     */
    handleArryInputValue(mode, field, index, $event) {
        this[mode][index][field] = $event.target.value;
    }

    /**
     * 監聽輸入欄位
     *
     * @param {*} field
     * @param {*} index
     * @param {*} $event
     * @memberof QaPlayComponent
     */
    handleInputValue(field, $event) {
        this[field] = $event.target.value;
    }
}
