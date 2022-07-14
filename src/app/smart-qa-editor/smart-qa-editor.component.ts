import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { HttpService } from "@core/services";
import { QaEditorService, ReplyContentService, SmartQaEditorService } from "@core/state";
import { TabsFrameService } from "@core/state/tabs-frame/tabs-frame.service";
import { environment } from "@env/environment";
import { GlobalService } from "@core/services";

/**
 * Smart QaEditor Component
 *
 * @export
 * @class SmartQaEditorComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-smart-qa-editor",
    templateUrl: "./smart-qa-editor.component.html",
    styleUrls: ["./smart-qa-editor.component.scss"],
})
export class SmartQaEditorComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private utilitiesService: UtilitiesService,
        private httpService: HttpService,
        private globalService: GlobalService,
        private tabsFrameService: TabsFrameService,
        private qaEditorService: QaEditorService,
        private replyContentService: ReplyContentService,
        private languageService: LanguageService,
        private postMessageService: PostMessageService,
        private smartQaEditorService: SmartQaEditorService
    ) {
        this.smartQaEditorObj = this.smartQaEditorService.smartQaEditorObject;
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    smartQaEditorObj = {};

    qaEditorObj: any = {};

    fAnswerResult: any = {};

    fActivitySelected: any = {};

    viewContainerRef: any;

    verifyState: any;

    SubVerifyState: any;

    SubIsClickMenu: any;

    tokenId: string = "";

    tenantId: string = "";

    hasError: boolean = false;

    curBotRxjs: any;

    curBot = {};

    isSatisfactionConflictStatus: boolean = false;

    /**
     * 關聯滿意度問題
     *
     * @memberof SmartQaEditorComponent
     */
    satisfactionName: string = "";

    /**
     * 通用滿意度是否衝突
     *
     * @type {boolean}
     * @memberof SmartQaEditorComponent
     */
    isSatisfactionConflict: boolean = false;

    /**
     * 是否顯示通用滿意度
     *
     * @type {boolean}
     * @memberof SmartQaEditorComponent
     */
    isGeneralSatisfaction: boolean = false;

    isMockEnv = !!this.utilitiesService.getMockSession();

    /**
     * clear all states
     *
     * @private
     * @memberof SmartQaEditorComponent
     */
    private clearAllStates() {
        this.qaEditorService.stateObject = {};
        this.qaEditorService.qaEditorOrderList = {};
        this.qaEditorService.activitySelected = {};
        this.qaEditorService.robotResult = {};

        // localStorage.setItem('isAnsExisted', 'false');
    }

    /**
     * upload media card file
     *
     * @private
     * @param {string} getTenantDataApi
     * @param {string} doUploadFileToApi
     * @param {*} answer
     * @param {string} k
     * @memberof SmartQaEditorComponent
     */
    private async uploadMediaCardFile(
        getTenantDataApi: string,
        doUploadFileToApi: string,
        answer: any,
        k: string,
        url: any,
        channelAnswer
    ) {
        const tenantData = await this.utilitiesService.doUploadFile(this, getTenantDataApi, {
            _header_: {
                tokenId: this.utilitiesService.getCookie("tkn"),
            },
            id: localStorage.getItem("tenantId"),
        });

        const FChannel = !!tenantData.data ? tenantData.data.FChannel : null;
        if (!!FChannel && FChannel.indexOf("messenger") >= 0) {
            const mediaResult = await this.utilitiesService.doUploadFile(this, doUploadFileToApi, {
                _header_: {
                    tokenId: this.utilitiesService.getCookie("tkn"),
                },
                tenantId: localStorage.getItem("tenantId"),
                channel: ["messenger"],
                fileType: answer[k].mediaType,
                // fileUrl: answer[k].originalContentUrl,
                fileUrl: url,
            });

            answer[k].fbId = mediaResult.attachment_id;
            channelAnswer.fbId = mediaResult.attachment_id;
        }
    }

    /**
     * get file url key
     *
     * @private
     * @param {*} answer
     * @returns
     * @memberof SmartQaEditorComponent
     */
    private getFileUrlKey(answer) {
        let key: any = Object.assign({});
        switch (answer.type) {
            case "Image":
                key = Object.assign({}, { answerKey: "imageUrl", resultKey: "urlOnline" });
                break;
            case "LinkImage":
                key = Object.assign({}, { answerKey: "imageUrl", resultKey: "urlOnline" });
                break;
            case "Video":
                if (answer.uploadMode === "upload")
                    key = Object.assign({}, { answerKey: "originalContentUrl", resultKey: "urlOnline" });
                break;
            case "Audio":
            case "MediaCard":
                key = Object.assign({}, { answerKey: "originalContentUrl", resultKey: "urlOnline" });
                break;
            case "Cards":
                key = Object.assign({}, { answerKey: "thumbnailImageUrl", resultKey: "urlOnline" });
                break;
            case "File":
                key = Object.assign({}, { answerKey: "url", resultKey: "url" });
                break;
        }
        return key;
    }

    /**
     * check tWebEmpty Answer
     *
     * @private
     * @param {*} answer
     * @returns
     * @memberof SmartQaEditorComponent
     */
    private checktWebEmptyAns(answer: any) {
        let result = Object.assign({});
        let isEmpty = false;

        isEmpty = this.isWebAnsEmpty(answer, isEmpty);

        if (isEmpty) {
            result = Object.assign(
                {},
                {
                    channel: "web",
                    type: "Text",
                    text: [""],
                    version: "v770",
                }
            );
        } else result = Object.assign({}, answer);

        return result;
    }

    /**
     * is web answer empty
     *
     * @private
     * @param {*} answer
     * @param {boolean} isEmpty
     * @returns
     * @memberof SmartQaEditorComponent
     */
    private isWebAnsEmpty(answer: any, isEmpty: boolean) {
        if (answer.channel === "web") {
            switch (answer.type) {
                case "Text":
                    break;
                case "LinkImage":
                case "Image":
                    if (
                        answer.gWUploadFormData === "" &&
                        answer.gWUploadThumbnailFormData === "" &&
                        answer.height === 0 &&
                        answer.imageClickUrl === "" &&
                        answer.imageUrl === "" &&
                        answer.name === "image" &&
                        answer.size === 0 &&
                        answer.thumbnailSize === 0 &&
                        answer.thumbnailUrl === "" &&
                        answer.width === 0
                    )
                        isEmpty = true;
                    break;
                case "Cards":
                    if (answer.FQACardColumn.length > 0) {
                        const cardEmpty = [];
                        answer.FQACardColumn.forEach((item) => {
                            if (!item) return;

                            let contentEmpty = false;
                            let btnEmpty = false;
                            if (
                                (item.FMsgAnswer === "" && item.gWUploadFormData === "") ||
                                (undefined && item.thumbnailImageUrl === "" && item.title === "")
                            )
                                contentEmpty = true;
                            if (item.FQACardAnswer === undefined || item.FQACardAnswer.length === 0) btnEmpty = true;
                            else {
                                item.FQACardAnswer.forEach((btn) => {
                                    if (btn.FCode === "" && btn.FDisplayText === "" && btn.FShowText === "")
                                        btnEmpty = true;
                                });
                            }
                            cardEmpty.push(contentEmpty);
                            cardEmpty.push(btnEmpty);
                        });
                        if (!~cardEmpty.indexOf(false)) isEmpty = true;
                    } else {
                        isEmpty = true;
                    }
                    break;
                case "Audio":
                    if (
                        answer.duration === 0 &&
                        answer.gWUploadFormData === "" &&
                        answer.name === "audio" &&
                        answer.originalContentUrl === "" &&
                        answer.size === 0
                    )
                        isEmpty = true;
                    break;
                case "File":
                    if (
                        answer.name === "file" ||
                        answer.name === "" ||
                        (answer.gWUploadFormData === "" && answer.size === 0 && answer.url === "")
                    )
                        isEmpty = true;
                    break;
                case "Video":
                    if (
                        answer.gWUploadFormData === "" &&
                        answer.gWUploadSysFormData === "" &&
                        answer.gWUploadThumbnailFormData === "" &&
                        answer.name === "video" &&
                        answer.originalContentUrl === "" &&
                        answer.thumbnailUrl === ""
                    )
                        isEmpty = true;
                    break;
                case "External":
                    if (answer.url === "") isEmpty = true;
                    break;
                case "Json":
                case "Quote":
                    if (!answer.content) isEmpty = true;
                    break;
                case "MediaCard":
                    const MediaCardEmpty = [];

                    if (
                        answer.fbId === "" &&
                        answer.gWUploadFormData === "" &&
                        answer.name === "MediaCard" &&
                        answer.originalContentUrl === "" &&
                        answer.size === 0
                    )
                        MediaCardEmpty.push(true);
                    else MediaCardEmpty.push(false);

                    if (!answer.FQACardAnswer || (answer.FQACardAnswer && answer.FQACardAnswer.length === 0))
                        MediaCardEmpty.push(true);
                    else {
                        answer.FQACardAnswer.forEach((btn) => {
                            if (btn.FCode === "" && btn.FDisplayText === "" && btn.FShowText === "")
                                MediaCardEmpty.push(true);
                            else MediaCardEmpty.push(false);
                        });
                    }

                    if (!~MediaCardEmpty.indexOf(false)) isEmpty = true;
                    break;
            }
        }
        return isEmpty;
    }

    /**
     * fill missing channel
     *
     * @private
     * @param {any[]} qaEditorAnswers
     * @memberof SmartQaEditorComponent
     */
    private fillMissingChannel(qaEditorAnswers: any[]) {
        const tabActivityObj = {};
        for (const i of qaEditorAnswers) {
            if (!!~i.FChannel.indexOf("_Activity")) tabActivityObj[i.FChannel] = true;
        }

        const missingTabs = [];
        for (const i of qaEditorAnswers) {
            if (tabActivityObj[i.FChannel]) {
                const tab = i.FChannel?.split("_Activity")[0].toLowerCase();
                let tabCount = 0;
                for (const j of qaEditorAnswers) {
                    if (!!~j.FChannel.indexOf(tab)) tabCount++;
                }

                if (tabCount < 2) missingTabs.push(tab);
            }
        }

        for (const i of missingTabs) {
            const ansObj = {
                FChannel: i,
                FIndex: 1,
                FIsDefault: 1,
                FType: "multiple",
                FActivityId: "0",
                FContent: JSON.stringify({
                    ans: [
                        {
                            type: "Text",
                            version: "v770",
                            text: [""],
                        },
                    ],
                }),
            };

            if (i === "web") qaEditorAnswers.unshift(ansObj);
            else qaEditorAnswers.push(ansObj);
        }
    }

    /**
     * on message
     *
     * @private
     * @memberof SmartQaEditorComponent
     */
    private onMessage() {
        window.onmessage = (e) => {
            this.postMessageService.postMessage("custom", { type: "componentIsReady" }, "*");

            localStorage.setItem("isAnsExisted", !!e?.data?.result ? "true" : "false");

            switch (e.data.type) {
                case "smartQA":
                    // get activity data
                    localStorage.setItem("activityList", JSON.stringify(e.data.activityData));

                    if (document.getElementById("confirm-cancel-btn"))
                        document.getElementById("confirm-cancel-btn").click();

                    if (document.getElementById("alert_close_btn")) document.getElementById("alert_close_btn").click();

                    if (e.data.fChannel && e.data.fChannel !== "") localStorage.setItem("fChannel", e.data.fChannel);

                    if (e.data.tokenId && e.data.tokenId !== "") this.utilitiesService.setCookie("tkn", e.data.tokenId);

                    if (e.data.tenantId && e.data.tenantId !== "") localStorage.setItem("tenantId", e.data.tenantId);

                    this.replyContentService.clearReplyContentService();

                    if (
                        e.data.smartQAData.FQuestionSatisfactionId &&
                        e.data.smartQAData.FQuestionSatisfactionId !== ""
                    ) {
                        this.isGeneralSatisfaction = true;
                        this.satisfactionName = e.data.smartQAData.FQuestionSatisfactionId$;
                        localStorage.setItem("FQuestionSatisfactionId$", e.data.smartQAData.FQuestionSatisfactionId$);
                    } else this.isGeneralSatisfaction = false;

                    if (e.data.qaEditorAnswer.length > 0) {
                        let isHasWeb: boolean = false;
                        let isSatisfactionConflict: boolean = false;
                        e.data.qaEditorAnswer.forEach((item) => {
                            if (item.FChannel === "web") isHasWeb = true;
                            if (item.FType === "Json") isSatisfactionConflict = true;

                            item.FSmartQAData = e.data.smartQAData;
                        });

                        if (isSatisfactionConflict) this.isSatisfactionConflict = true;
                        else this.isSatisfactionConflict = false;

                        if (!isHasWeb) {
                            const newArr = [
                                {
                                    FChannel: "web",
                                    FContent: {
                                        text: [""],
                                        type: "Text",
                                        version: "v770",
                                    },
                                    FIsDefault: true,
                                    FType: "Text",
                                    FActivityId: "",
                                    FActivityId$: "",
                                },
                            ];

                            e.data.qaEditorAnswer.forEach((item) => {
                                newArr.push(item);
                            });
                            e.data.qaEditorAnswer = newArr;
                        }
                    }

                    this.onLoad(e.data);

                    break;
                case "replyQaBtn":
                    this.smartQaEditorService.setReplyQAData(e.data.quickReplyObj, e.data.replyId);
                    break;
                case "quoteAnswer":
                    this.qaEditorService.setQuoteQAData(e.data.quoteQAObj, e.data.replyId);
                    break;
                case "UiConfig":
                    const config = e.data.result;
                    this.setUiVisible(config);
                    break;
                case "labelEditorSave":
                    switch (e.data.mode) {
                        case "answer":
                            this.qaEditorService.valueContentData[e.data.tab] = e.data.result;
                            break;
                        case "quickReply":
                            this.qaEditorService.replyContentLabelData[e.data.channel][e.data.index] = e.data.result;
                            break;
                        case "card":
                            const channel = e.data.channel || "";
                            if (!channel) return;

                            let componentId = e.data.componentId;
                            componentId = componentId.replace("_undefined", "");
                            const cardLabelData = this.qaEditorService?.cardLabelData || {};
                            if (!!cardLabelData?.[channel]?.[componentId])
                                cardLabelData[channel][componentId][e.data.index] = e.data.result;
                            else {
                                const data = {};
                                data[componentId] = [];
                                data[componentId][e.data.index] = e.data.result;
                                cardLabelData[channel] = data;
                            }
                            break;
                    }
                    break;
            }
        };
    }

    /**
     * setUiVisible
     *
     * @param {*} setting
     * @memberof SmartQaEditorComponent
     */
    setUiVisible(setting) {
        if (setting && setting.length > 0) {
            setting.forEach((item) => {
                let prototype = item.action;
                let attr = null;
                let status: boolean;
                const isCondition = item.hasOwnProperty("condition") && item.condition;

                if (item.action === "disabled" || item.action === "abled") {
                    prototype = "attr";
                    attr = item.action;
                    if (item.action === "disabled") status = true;
                    else status = false;
                }

                switch (item.type) {
                    case "id":
                        if (item.hasOwnProperty("condition")) {
                            if (isCondition) {
                                if (prototype === "attr") {
                                    if (item.action === "disabled")
                                        document.getElementById(item.name).setAttribute("disabled", "disabled");
                                    else document.getElementById(item.name).removeAttribute("disabled");
                                } else {
                                    if (prototype === "show")
                                        document.getElementById(item.name).style.cssText = "display:block;";
                                    else document.getElementById(item.name).style.cssText = "display:none;";
                                }
                            }
                        } else {
                            if (prototype === "attr") {
                                if (item.action === "disabled")
                                    document.getElementById(item.name).setAttribute("disabled", "disabled");
                                else document.getElementById(item.name).removeAttribute("disabled");
                            } else {
                                if (prototype === "show")
                                    document.getElementById(item.name).style.cssText = "display:block;";
                                else document.getElementById(item.name).style.cssText = "display:none;";
                            }
                        }
                        break;
                }
            });
        }
    }

    private filterEnableAnswers(qaEditorAnswers = []) {
        const channels = this.utilitiesService.getEnableChannels(this.curBot["FChannel"]) || [];
        const enableAnswers = qaEditorAnswers.map((item) => {
            const isEnable = channels.some((channel) => {
                return !!~item.FChannel.indexOf(channel);
            });
            return isEnable ? item : null;
        });

        return enableAnswers.filter((item) => {
            return !!item;
        });
    }

    /**
     * on uniLoad
     *
     * @param {*} [qaEditorAnswer=null]
     * @memberof SmartQaEditorComponent
     */
    async onUniLoad(qaEditorAnswer = null) {
        this.clearAllStates();

        // localStorage.setItem('isAnsExisted', 'true');
        const qaEditorAnswers: any =
            qaEditorAnswer ||
            (await this.httpService.httpGET(
                "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/qaEditorAnswer"
            ));

        // 沒有保存過的答案
        if (!qaEditorAnswers[0]) this.onEmptyLoad();

        // fill missing default channels
        this.fillMissingChannel(qaEditorAnswers);

        const result = {};
        const toOpenChannelArr = [];
        const activitySelectedObject = {};
        const qaEditorEnableAnswers = this.filterEnableAnswers(qaEditorAnswers);
        if (!qaEditorEnableAnswers.length) return;

        for (const loadData of qaEditorEnableAnswers) {
            const channelId = loadData.FId;
            const channel = loadData.FChannel;
            const fContent = loadData.FContent || {};
            const fAnswer = [fContent];

            for (const i of fAnswer) {
                i.channelId = channelId || "";
                i.channel = channel;
            }

            result[channel] = fAnswer;

            // set ACTIVITY to activitySelectedObject
            const FActivityIdStr = (loadData.FActivityId || "") + "," + (loadData.FActivityId$ || "");
            activitySelectedObject[channel] = FActivityIdStr;

            // set ACTIVITY to fActivitySelected for UNOPEN channels
            if (!!loadData.FActivityId) {
                this.fActivitySelected[channel] = {
                    activitySelect: loadData.FActivityId || "",
                    activitySelectName: loadData.FActivityId$ || "",
                };

                // set qaEditorAnswers to smartQaEditorObject for CLONE
                this.smartQaEditorService.smartQaEditorObject["fActivitySelected"] = {};
                this.smartQaEditorService.smartQaEditorObject["fActivitySelected"] = this.fActivitySelected;
            }

            toOpenChannelArr.push(channel);
        }

        // default web channel when no save
        if (!toOpenChannelArr.length) toOpenChannelArr.push("web");

        this.smartQaEditorService.smartQaEditorObject["toCloseChannelArr"] = toOpenChannelArr;

        // set qaEditorAnswers to fAnswerResult for UNOPEN channels
        this.fAnswerResult = result;

        // set qaEditorAnswers to smartQaEditorObject for CLONE
        this.smartQaEditorService.smartQaEditorObject["fAnswerResult"] = {};
        this.smartQaEditorService.smartQaEditorObject["fAnswerResult"] = result;

        this.tabsFrameService.setState({
            action: { close: true },
            activitySelectedObject,
            toOpenChannelArr,
            data: { result },
        });

        // GET UICONFIG
        this.postMessageService.postMessage("custom", {
            type: "NG_ONINIT",
            data: {
                component: "smart-qa-editor",
            },
        });

        this.postMessageService.postMessage("custom", {
            type: "loaderHide",
        });
    }

    /**
     * on load
     *
     * @param {*} [qaEditorAnswer=null]
     * @memberof SmartQaEditorComponent
     */
    async onLoad(data = null) {
        this.clearAllStates();

        // localStorage.setItem('isAnsExisted', 'true');

        const qaEditorAnswer = data?.qaEditorAnswer;
        const qaEditorAnswers: any =
            qaEditorAnswer ||
            (await this.httpService.httpGET(
                "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/qaEditorAnswers"
            ));

        // 沒有保存過的答案
        if (!qaEditorAnswers[0]) this.onEmptyLoad();

        sessionStorage.removeItem("smartQAData");
        if (!!data?.smartQAData) sessionStorage.setItem("smartQAData", JSON.stringify(data.smartQAData));

        // fill missing default channels
        this.fillMissingChannel(qaEditorAnswers);

        const result = {};
        const valueContent = {};
        const oauthTokenTarget = {};
        const smartQAData = {};
        const toOpenChannelArr = [];
        const activitySelectedObject = {};
        const qaEditorEnableAnswers = this.filterEnableAnswers(qaEditorAnswers);
        if (!qaEditorEnableAnswers.length) return;

        for (const loadData of qaEditorEnableAnswers) {
            const channelId = loadData.FId;
            const channel = loadData.FChannel;
            const fContent =
                typeof loadData.FContent === "string" ? JSON.parse(loadData.FContent) || {} : loadData.FContent || {};

            const fAnswer = loadData.FType.toLowerCase() === "multiple" ? fContent.ans || [] : [fContent];

            for (const i of fAnswer) {
                i.channelId = channelId || "";
                i.channel = channel;
            }

            smartQAData[channel] = loadData.FSmartQAData;
            valueContent[channel] = loadData.FValueContent;
            oauthTokenTarget[channel] = loadData.FOAuthTokenTarget || "noAuth";
            result[channel] = fAnswer;

            // set ACTIVITY to activitySelectedObject
            const FActivityIdStr = (loadData.FActivityId || "") + "," + (loadData.FActivityId$ || "");
            activitySelectedObject[channel] = FActivityIdStr;

            // set ACTIVITY to fActivitySelected for UNOPEN channels
            if (!!loadData.FActivityId) {
                this.fActivitySelected[channel] = {
                    activitySelect: loadData.FActivityId || "",
                    activitySelectName: loadData.FActivityId$ || "",
                };

                // set qaEditorAnswers to smartQaEditorObject for CLONE
                this.smartQaEditorService.smartQaEditorObject["fActivitySelected"] = {};
                this.smartQaEditorService.smartQaEditorObject["fActivitySelected"] = this.fActivitySelected;
            }

            toOpenChannelArr.push(channel);
        }

        // default web channel when no save
        if (!toOpenChannelArr.length) toOpenChannelArr.push("web");

        this.smartQaEditorService.smartQaEditorObject["toCloseChannelArr"] = toOpenChannelArr;

        // set qaEditorAnswers to fAnswerResult for UNOPEN channels
        this.fAnswerResult = result;

        // set qaEditorAnswers to smartQaEditorObject for CLONE
        this.smartQaEditorService.smartQaEditorObject["fAnswerResult"] = {};
        this.smartQaEditorService.smartQaEditorObject["fAnswerResult"] = result;

        // oauthTokenTarget保存資料時使用
        this.qaEditorService.oauthTokenTargetData = oauthTokenTarget;

        // 供各通道讀取資料使用
        this.tabsFrameService.setState({
            action: { close: true },
            activitySelectedObject,
            toOpenChannelArr,
            data: {
                smartQAData,
                valueContent,
                oauthTokenTarget,
                result,
            },
        });

        // GET UICONFIG
        this.postMessageService.postMessage("custom", {
            type: "NG_ONINIT",
            data: {
                component: "smart-qa-editor",
            },
        });

        this.postMessageService.postMessage("custom", {
            type: "loaderHide",
        });
    }

    /**
     * on save
     *
     * @memberof SmartQaEditorComponent
     */
    async onSave() {
        const stateObject = this.qaEditorService.stateObject;
        this.postMessageService.postMessage("custom", {
            type: "loaderShow",
        });

        console.log("%cAnswer Here : ", "font-size:24px; color:red");
        console.debug("stateObject:", stateObject);
        console.debug("valueContentData:", this.qaEditorService.valueContentData);

        this.hasError = false;
        this.qaEditorService.clearIsRequiredVerifyState();
        this.qaEditorService.isRequiredVerify = false;
        this.qaEditorService.clearVerify();
        this.qaEditorService.setIsSave();
        let isVaild: boolean = true;
        if (this.verifyState.length > 0) {
            this.verifyState.forEach((item) => {
                if (!item.state) {
                    isVaild = false;
                    console.debug(
                        "Verify Failed. \nId：" +
                            item.id +
                            "\nComponent：" +
                            item.component +
                            "\nChannel：" +
                            item.channel
                    );
                }
            });
        }

        if (isVaild) {
            console.debug("----- Answer is Valid. -----");

            const finalAnswer = await this.getFinalAnswer();

            // has error occur
            if (this.hasError) {
                this.postMessageService.postMessage("custom", {
                    type: "loaderHide",
                });
                this.postMessageService.postMessage("custom", {
                    type: "doSweetAlert",
                    data: {
                        title: this.i18n?.SMART_QA_EDITOR?.ERROR,
                        text: this.i18n?.SMART_QA_EDITOR?.SAVE_FAIL,
                        type: "error",
                        confirmButtonText: this.i18n?.SMART_QA_EDITOR?.COMFIRM,
                    },
                });
            } else {
                this.postMessageService.postMessage("custom", {
                    type: "smartQAEditorOnSave",
                    data: finalAnswer,
                });
                this.qaEditorService.setIsNeedVerify(false);
            }
        } else {
            this.postMessageService.postMessage("custom", {
                type: "loaderHide",
            });
            this.postMessageService.postMessage("custom", {
                type: "doSweetAlert",
                data: {
                    title: this.i18n?.SMART_QA_EDITOR?.OOPS,
                    text: this.i18n?.SMART_QA_EDITOR?.VERIFY_INVAILD,
                    type: "warning",
                    confirmButtonText: this.i18n?.SMART_QA_EDITOR?.COMFIRM,
                },
            });
        }
    }

    /**
     * get final answer
     *
     * @returns
     * @memberof SmartQaEditorComponent
     */
    async getFinalAnswer() {
        // upload path config
        const doUploadFileApi = "/openapi/cbe/doUploadFile";
        const doUploadFileToApi = "/openapi/cbe/doUploadFileTo";
        const getTenantDataApi = "/openapi/cbe/tenant/item";

        // scan data from stateObject to qaEditorObject
        const orderList = this.qaEditorService.qaEditorOrderList || {};
        const channelList = Object.keys(orderList);
        const qaEditorObject = this.utilitiesService.scanQaEditorObj(this, channelList, {});

        console.debug("qaEditorObject:", qaEditorObject);

        // get final answer
        const finalAnswer: any = [];
        for (let i = 0; i < channelList.length; i++) {
            const answer = qaEditorObject.result[channelList[i]] || [];
            const quickReply: any = {
                type: "QuickReply",
                QuickReply: {},
                version: "v770",
            };
            let qaEditorArray = [];
            let webview = "";
            let quickReplyItem = "";
            let play = {};
            let command = {};
            const robotCommand = "";

            if (!answer.length) continue;

            for (const k in answer) {
                // If Web will must be verify,delete checkWebEmptyAns function.
                let channelAnswer = answer[k];
                channelAnswer = this.checktWebEmptyAns(channelAnswer);

                // Play
                if (channelAnswer.type === "play") {
                    play = channelAnswer.params;
                    command = channelAnswer.command || {};
                    continue;
                }

                // QuickReply
                if (channelAnswer.type === "QuickReply") {
                    quickReplyItem = channelAnswer.reply.qReply_0;
                    continue;
                }

                // Webview
                if (channelAnswer.type === "Webview") {
                    webview = channelAnswer.webview;
                    continue;
                }

                // Upload answers
                await this.doUploadAnswers(
                    channelAnswer,
                    doUploadFileApi,
                    getTenantDataApi,
                    doUploadFileToApi,
                    answer,
                    k
                );

                delete channelAnswer.channel;
                delete channelAnswer.gWUploadFormData;
                delete channelAnswer.gWUploadSysFormData;
                delete channelAnswer.gWUploadThumbnailFormData;

                qaEditorArray.push(channelAnswer);
            }

            let finalAnswerObject = {};
            ({ finalAnswerObject, qaEditorArray } = this.qaEditorService.prepareFinalAnswer(
                quickReplyItem,
                qaEditorArray,
                quickReply,
                webview,
                robotCommand,
                channelList[i],
                play,
                command
            ));

            // set ACTIVITY selected
            let fActivityIdVal = "";
            const activitySelectedObj = this.qaEditorService.activitySelected;
            if (!!activitySelectedObj[channelList[i]])
                fActivityIdVal = activitySelectedObj[channelList[i]].activitySelect;

            // make the finalAnswer from finalAnswerObject
            this.makeFinalAnswer(channelList[i], finalAnswer, finalAnswerObject, fActivityIdVal);
        }

        // set UNOPEN channels to FinalAnswer
        const unopenTabStack = this.smartQaEditorService.smartQaEditorObject["unopenTabStack"];
        for (const tab of unopenTabStack) {
            const loadQaEditorArray = this.fAnswerResult[tab];

            // set ACTIVITY selected
            let fActivityIdVal = "";
            const loadActivitySelectedObj = this.fActivitySelected;
            if (!!loadActivitySelectedObj[tab]) fActivityIdVal = loadActivitySelectedObj[tab].activitySelect;

            // finalAnswerObject
            let loadFinalAnswerObject = JSON.parse(JSON.stringify({}));
            loadFinalAnswerObject = this.qaEditorService.setFinalAnsObj(loadQaEditorArray, loadFinalAnswerObject);

            // make the finalAnswer from loadFinalAnswerObject
            this.makeFinalAnswer(tab, finalAnswer, loadFinalAnswerObject, fActivityIdVal);
        }

        console.debug("FinalAnswer:", finalAnswer);

        return finalAnswer;
    }

    /**
     * make final answer
     *
     * @private
     * @param {string} channel
     * @param {*} finalAnswer
     * @param {*} finalAnswerObject
     * @param {string} [fActivityIdVal='']
     * @memberof SmartQaEditorComponent
     */
    private makeFinalAnswer(channel: string, finalAnswer: any, finalAnswerObject: any, fActivityIdVal = "") {
        if (
            channel === "web" &&
            finalAnswerObject.type === "Text" &&
            finalAnswerObject.text.length === 1 &&
            finalAnswerObject.text[0].length === 0
        )
            finalAnswerObject = "";

        let FId = "";
        if (!!finalAnswerObject.ans && !!finalAnswerObject.ans[0]) FId = finalAnswerObject.ans[0].channelId;
        else if (!!finalAnswerObject.channelId) FId = finalAnswerObject.channelId;

        finalAnswer.push({
            FType: finalAnswerObject ? finalAnswerObject.type || "Json" : "Text",
            FActivityId: fActivityIdVal,
            FId,
            FChannel: channel,
            FContent: finalAnswerObject,
            FValueContent: this.qaEditorService.valueContentData[channel] || "",
            FOAuthTokenTarget: this.qaEditorService.oauthTokenTargetData[channel] || "noAuth",
        });
    }

    /**
     * do upload answers
     *
     * @private
     * @param {*} channelAnswer
     * @param {string} doUploadFileApi
     * @param {string} getTenantDataApi
     * @param {string} doUploadFileToApi
     * @param {*} answer
     * @param {string} k
     * @memberof SmartQaEditorComponent
     */
    private async doUploadAnswers(
        channelAnswer: any,
        doUploadFileApi: string,
        getTenantDataApi: string,
        doUploadFileToApi: string,
        answer: any,
        k: string
    ) {
        // Except Card
        if (!!channelAnswer.gWUploadFormData && channelAnswer.type !== "Cards") {
            // upload file except card
            const uploadInfo = await this.uploadFileExceptCard(doUploadFileApi, channelAnswer, k);

            if (channelAnswer.type === "MediaCard") {
                // 先去 call 租戶授權通路確認有無 messenger channel 有的話就 call doUploadFileTo api
                // mediacard images upload
                await this.uploadMediaCardFile(
                    getTenantDataApi,
                    doUploadFileToApi,
                    answer,
                    k,
                    uploadInfo.url,
                    channelAnswer
                );
            }
        }

        if (!!~channelAnswer.channel.indexOf("google") && !!channelAnswer?.googleAudio?.gWUploadFormData) {
            if (!channelAnswer?.googleAudio?.gWUploadFormData._header_)
                await this.uploadFileExceptCard(doUploadFileApi, answer, k, channelAnswer.googleAudio.gWUploadFormData);
        }

        // Card
        if (channelAnswer.type === "Cards") {
            for (let j = 0; j < channelAnswer.FQACardColumn.length; j++) {
                // card images upload
                if (!!channelAnswer.FQACardColumn[j].gWUploadFormData) {
                    const cardsResult = await this.utilitiesService.doUploadFile(
                        this,
                        doUploadFileApi,
                        channelAnswer.FQACardColumn[j].gWUploadFormData
                    );

                    const key: any = this.getFileUrlKey(channelAnswer);
                    channelAnswer.FQACardColumn[j][key.answerKey] = cardsResult[key.resultKey];
                    delete channelAnswer.FQACardColumn[j].gWUploadFormData;
                }
                delete channelAnswer.FQACardColumn[j].channel;
            }
        }

        // Thumbnail
        if (!!channelAnswer.gWUploadThumbnailFormData) {
            // thumbnail upload
            const thumbnailResult = await this.utilitiesService.doUploadFile(
                this,
                doUploadFileApi,
                channelAnswer.gWUploadThumbnailFormData
            );

            channelAnswer["thumbnailUrl"] = thumbnailResult.url;
        }

        // System thumbnail
        if (!!channelAnswer.gWUploadSysFormData) {
            // system thumbnail upload
            const systemResult = await this.utilitiesService.doUploadFile(
                this,
                doUploadFileApi,
                channelAnswer.gWUploadSysFormData
            );

            channelAnswer["sysThumbnailUrl"] = systemResult.url || "";
        }
    }

    /**
     * upload file except card
     *
     * @private
     * @param {string} doUploadFileApi
     * @param {*} channelAnswer
     * @memberof SmartQaEditorComponent
     */
    private async uploadFileExceptCard(
        doUploadFileApi: string,
        channelAnswer: any,
        k: string = "",
        gWUploadFormData = null
    ) {
        const formData = gWUploadFormData || channelAnswer.gWUploadFormData;
        const result: any = await this.httpService.httpPOST(doUploadFileApi, formData);
        const formDataType = result.name.split(".")[1];
        if (result.message) {
            console.error("do doUploadFile Function API Fail. Error: " + result);
            this.hasError = true;
        }

        // system thumbnail url
        const key: any = Object.assign({}, this.getFileUrlKey(channelAnswer));

        channelAnswer[key.answerKey] = result[key.resultKey];
        if (channelAnswer.type === "Image") {
            channelAnswer.sysThumbnailUrl = result.thumbnailUrl;
            if (channelAnswer.thumbnailMode === "system") {
                channelAnswer.sysThumbnailUrl = channelAnswer.thumbnailUrl = result.thumbnailUrl;
            }
        } else {
            const channel = channelAnswer[k]?.channel || channelAnswer?.channel;
            const answer = channelAnswer[k] || channelAnswer;

            // rewrite google audio imageUrl
            if (!!~channel.indexOf("google") && answer.type === "Audio") {
                if (!!~".jpg,.jpeg,.png".indexOf(formDataType)) answer.googleAudio.imageUrl = result.url;
            }
        }
        return result;
    }

    /**
     * on empty load
     *
     * @memberof SmartQaEditorComponent
     */
    onEmptyLoad() {
        // localStorage.setItem('isAnsExisted', 'false');

        window.location.reload();
    }

    encryptData =
        "z/4yq6Ts3SEDbGUfiAa+/oFj223MPON7kloeK7FJ6p8JVT2TJ77XNr5ZCqmgtlaw++t6xMolZatxeVDuHQ6fp5jqTG0D8jhZ/e9zuWjLc/f626iY9dqd88fOtzmTncO+c6nH0gaqwn/PLP7AN76D5nwuXzMetM/AY4y9GNp6sUxI9/J9Cw0CqsmilRuPa0jT8x0iYvuvPxi86Y/DMbrmnUWMUDBrnJ+/ljw0qPCT9nolZ+vfcimbsk8tLJR5rp4TjLihE0h+42/FIc0vg+gC8bHCXz/sPYkRvSSs5qh9de+lSZnhPa8KRFQqm1v3jl0sObqOAT9U4uS1qxAbzYoOtOn5jDYDTraKxLrTD1LnlVbiKQCL6AlOZDPuoGs5uGF0r7SAgbJ/RpFF+8WpdglrgOH77uhfYeJtObFbzmAHZ6OW7ZIntgDLvVc0TIoPiZrTGuNNpiT0l4Md0s0irI2FEfHOD6e6R3VYZPyTj+rfuRKdqDRRa2cl6zmoCHdL9p/oQeOLPA53DZSYIDEci4nc18w/gUimxm1/GTxxjKT9JS82atK5KJ8cqBqG3eIvFH4R9cYL2wo7v+3/pe+NsfDJe18gIrOg3ojNWzbalFlSSfFSaaz+3t1sDx73PxX8Z9gAqb+TI+vIcvOWDHJOT0X+A8m+N3YNbvmN+Focy2I43vjtAdWTq0KwtZ++Pb/CS9lUxrwMrOXUnoaOAxVoYZe84qSKuhVuZOYwzpcSsQ+1u6XWiYfwrFBvIJysYldOwU1LbhQekrz5gtBC6kX8ve5Rf9OaR+9Y/TAkc3uGie+jpUK5A6Z07Y0pI/GLIRnWH/Cw/xX0leVW9Cs6TCc7+e75aJ/5oa70pCHLNvH2IVapjQwQ9EehA5CqR/APcKI5Co3N5giabardg3f6kQa/AEdUPHMIen9cy/tbMcVHkHqAZrufVjSCGynwk4l4oiSM8XR6FhvZ/bMU3Yo5I9KKqV9KXFGbWXjsW8wUhK4XYZ8vvBeBpVXeCAlzck5bOyBvrexonDC0W7buQyRECo1walBs0OEkwVOtxkN+6entR3Fn+0tMktUvWx5HejavP9z/SnmuPGybg3yHJWjdv8MQtgVnLG2PwRNPoKZB7+9orJWMGzhyylluJ0qjhQTD/hoDj3fvbsak+4TvDOznZ1Eu2rO497rmkXgPAFl4TDlaUru/lhDKqjbn08zVTSgIlTuVBygnBGTo4OEElihVwD/dTzm0q/kblZM5hAFkwzhCiLiv/cUZ5xw6XDeZ+hVoEpnpAuOaOSViEpXnCAINP/6L9rx6q4GVIhxVWEmGz3FPh4g84tUK4toaj3seBJ485dQqpdWvGTAh/sH/0PX/q3P6k105b+TbPs+d7Gf1sdx3gIKWqgVfIjE5NIOhLaI07AUTH0ryndzC4+cwWeGnhK9k9SNbyCkRlwo9E7sm2He6k0DFSFTMzfOZ+n7/VMS5QoD40vajGHcvb9Jn91b1e5SulaNMoPQg3057dUiUBTtI3z9LAtD7X9si8eqwwOlJCXUCuGYtZt/yj9KthjCS9P5dyIk4jfGv26tCAgDh5fgFgq1T3BiDyWYSym5jLTNSw7T4C/URrgpq9BXgkF3Ql66Fsrg+yj+mVSnxx/7U2nJC+TA53d7QgMaeFscB0WjUn4sD4ev2/zF72dW8fKsaU+IsrXpmvBqgbipXJoa744MrhKghZ0MThgHyRgsQBEsEAE8eLBkjUcck24htFJHBFFRDoQnVbFpDy9k4G29IOY73zpUE4wVyBmanPPxXhF3j9ngNK3GabNWTFp6mlx3rZqb2GbqUDRX8C8GNQ47AKtEoox0wwvzLIJdsazJJ0FxnFadWEpmFojFrikhCyI6QIj7s88twqconjGUCBozuLAsFsDOGwtQ2hOCIggcNSAhS+IE4HFkL8hN8DPjuS30dqpRyA3OwWwZ8LArAB9sYsgKWckFaxbxQEDlW1DdemXjN9ffhPXkdIUiZac0RW2+9IKnPGpD1pBUIR/uQCu6WjLUKWTrCR5hufsSTK0F9eqhUUtbdQRYG97pfCUjqi+MZjxs6WM+fkE5KuqmGeLnkI7xj5TNjelNFkKSoldxFWrhKhQeWej4MSt0nXO4NlTDG2J5zQIm58Y6SSVVD93noB5TGukW5ugHzLCpOVP+rY0GHBPyApZBjo/3x95C8QYpgfmTwXdd0jdhIti11sA7l5IwyenLm1tpG2rLxhOhSgQ8T0rHCoQRK24hr7eK0JhzWkZtvXVFE5LPu0iEw4cNfF43cyBZyZa8KTKDblKhteKYUaZ8ptZG04B7V+zKnDPLXnkcKsaiwhm6dNt88SN6XZD5WZMTJO1TlE6OgifzUf5mkxFhjGxGV7Jcx51+3vwlo3UWa7M+XV9+7nocCIR5nJ6G2mR52Q6QAmJ9RGKnEnwmfzeWsibuNjpxhXktb/zGdK8ijstsT8E8vbNMvjkuvrLdtXaC5LEhqYhzmWQPQp8+p0O7Bohs3g1dHOw9XT7NQcBhmAnHKx5c1UMgq4LRDOla6ZvSVWBaGqMvr68xOD+ghk1o/0i9sAHzq/16XDPfaWUwECfneam2X2/3BisqXY6N17JX4wLuHHjoIgXbfCw1o1upjg6EA3+ie99WmmLPkCAAxnDbWrVjQVIh7uwoxQuM3+jwUPCJBYHpROuqxwzB6UBiWG6eKMGquiWuIN9YypJ9le/ICxLxuz1/Ov5QIjIGA2bd5p54UeQKarRiEybNfPpYVm7C+XTfK/cHbTvkju2OIQB6AHcXnQR7Qjd/vARnPoXHVJWw3ObbfiDp5EVE3Rqi98vPi";

    async ngOnInit() {
        this.clearAllStates();

        this.smartQaEditorService.smartQaEditorObject["unopenTabStack"] = [];
        this.smartQaEditorService.smartQaEditorObject["toCloseChannelArr"] = [];

        if (!!~environment.env.indexOf("stage")) {
            const httpResult: any = await this.httpService.httpPOST("/openapi/cbe/tenant/item", {
                id: localStorage.getItem("tenantId"),
            });
            if (httpResult && httpResult.data) this.curBot = httpResult.data;
        } else {
            this.curBot = this.utilitiesService.getEncryptData("curBot");
            this.curBotRxjs = this.globalService.curBotRxjs$.subscribe(() => {
                this.curBot = this.utilitiesService.getEncryptData("curBot");
            });
        }

        if (!this.isMockEnv && environment.env === "stage") this.onMessage();
        else {
            const activityData = await this.httpService.httpGET(
                "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/activitiesList"
            );
            this.smartQaEditorService.smartQaEditorObject["activityList"] = activityData;
            localStorage.setItem("activityList", JSON.stringify(activityData));

            // for GoJS Testing
            if (!!localStorage.getItem("ivrData")) {
                this.onLoad(JSON.parse(localStorage.getItem("ivrData")));
                this.isMockEnv = false;
                localStorage.removeItem("ivrData");

                localStorage.setItem("encryptData", this.encryptData);
            }
        }

        // 為了處理空答案資料會被砍掉問題
        if (!!localStorage.getItem("FQuestionSatisfactionId")) this.isGeneralSatisfaction = true;
        if (!!localStorage.getItem("FQuestionSatisfactionId$"))
            this.satisfactionName = localStorage.getItem("FQuestionSatisfactionId$");

        this.SubVerifyState = this.qaEditorService.verifyState$.subscribe((resp) => {
            this.verifyState = resp;
        });
    }

    ngAfterViewInit() {
        this.isSatisfactionConflict = false;
        this.SubIsClickMenu = this.qaEditorService.isClickMenu.subscribe((resp: any) => {
            if (resp) {
                if (resp === "qa-json") {
                    this.isSatisfactionConflict = true;
                    console.log("click");
                    console.log("resp:", resp);
                } else {
                    const orderList = this.qaEditorService.qaEditorOrderList || {};
                    const channelList = Object.keys(orderList);
                    const qaEditorAnswerType = this.utilitiesService.scanQaEditorAnswerType(this, channelList, {});

                    // 因為此訂閱觸發時，切換後的元件尚未建立完畢，所以會取不到當前選擇的元件
                    this.isSatisfactionConflictStatus = !!~qaEditorAnswerType.indexOf("Json") ? true : false;
                }
            }
        });
    }

    ngAfterViewChecked() {
        this.isSatisfactionConflict = this.isSatisfactionConflictStatus;
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        if (!!this.SubVerifyState) this.SubVerifyState.unsubscribe();
        if (!!this.SubIsClickMenu) this.SubIsClickMenu.unsubscribe();

        this.smartQaEditorService.smartQaEditorObject = {};

        this.clearAllStates();
    }
}
