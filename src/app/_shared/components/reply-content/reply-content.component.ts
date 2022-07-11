import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, AfterViewChecked } from "@angular/core";
import {
    QaEditorService,
    ReplyContentService,
    SmartQaEditorService,
    GreetingEditorService,
    SatisfactionSurveyEditorService,
} from "@core/state";
import { NbMenuService, NbDialogService } from "@nebular/theme";
import { VerifyService } from "@core/services";
import { IAnsReplyContentJson } from "@core/state/qa-editor/answer-json.interface";
import { NbTabComponent, NbTabsetComponent } from "@nebular/theme";
import { LanguageService, PostMessageService } from "@core/utils";
import { TemplateDialogComponent } from "@shared/components";
import { environment } from "@env/environment";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

/**
 * Set QaCode Object interface
 *
 * @export
 * @interface SetQaCodeObj
 */
export interface SetQaCodeObj {
    keyId: string;
    name: string;
}
/**
 * Reply Content Component
 *
 * @export
 * @class ReplyContentComponent
 * @implements {OnInit}
 * @implements {AfterViewChecked}
 */
@Component({
    selector: "cbe-shared-reply-content",
    templateUrl: "./reply-content.component.html",
    styleUrls: ["./reply-content.component.scss"],
})
export class ReplyContentComponent implements OnInit, AfterViewChecked {
    /**
     * @ignore
     */
    constructor(
        private nbDialogService: NbDialogService,
        private replyContentService: ReplyContentService,
        private smartQaEditorService: SmartQaEditorService,
        private greetingEditorService: GreetingEditorService,
        private satisfactionSurveyEditorService: SatisfactionSurveyEditorService,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private changeDetectorRef: ChangeDetectorRef,
        private languageService: LanguageService,
        private postMessageService: PostMessageService
    ) {
        this.languageService.language$.subscribe((resp) => {
            this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        });
    }

    @ViewChild("replyShowText") replyShowText: ElementRef;
    @ViewChild("replyQaDisplayText") replyQaDisplayText: ElementRef;
    @ViewChild("replyQaCode") replyQaCode: ElementRef;
    @ViewChild("replyOptionDisplayText") replyOptionDisplayText: ElementRef;
    @ViewChild("replyOptionCode") replyOptionCode: ElementRef;
    @ViewChild("replyUrl") replyUrl: ElementRef;
    @ViewChild("replyOption") replyOption: NbTabsetComponent;
    @ViewChild("QATab") QATab: NbTabComponent;
    @ViewChild("OptionTab") OptionTab: NbTabComponent;
    @ViewChild("UrlTab") UrlTab: NbTabComponent;

    @Input() data: any;

    QA_EDITOR: any;

    isLoad = false;

    isOninit: boolean = false;

    // Reserve a field for imageUrl parameter
    isImageUrl = false;

    ReplyContentState: any;

    replyContentObj: any = {};

    isVerifyStatus: boolean = true;

    subIsSave: any;

    subReplyQAData: any;

    subGreetingReplyQAData: any;

    subIsNeedVerify: any;

    subIsClearReplyAry: any;

    replyBtnAry: any = [];

    lastResultArr: any = [];

    initVerifyState = { state: true, errMsg: "" };

    subSatisfactionSurveyReplyQAData: any;

    isVerify: boolean = false;

    isReplyQaDisplayText = true;

    /**
     * verify State
     *
     * @type {*}
     * @memberof ReplyContentComponent
     */
    verifyState: any = {
        showText: this.initVerifyState,
        qaDisplayText: this.initVerifyState,
        qaCode: this.initVerifyState,
        optionDisplayText: this.initVerifyState,
        optionCode: this.initVerifyState,
        url: this.initVerifyState,
        replyCount: this.initVerifyState,
    };

    /**
     * verify Object
     *
     * @memberof ReplyContentComponent
     */
    verifyObj = {
        replyCount: ["minBtnCount,1"],
        showText: ["maxLength,20", "isRequired"],
        qaDisplayText: ["maxLength,100", "isRequired"],
        qaCode: ["maxLength,300", "isRequired"],
        optionCode: ["maxLength,300", "isRequired"],
        optionDisplayText: ["maxLength,100", "isRequired"],
        url: ["hasHTTPS", "maxLength,1000", "isRequired"],
    };

    googleAudioState: any;

    isGoogleAudio = "";

    onPricetagsClick(index) {
        if (!!~environment.env.indexOf("stage")) {
            this.postMessageService.postMessage("custom", {
                type: "showLabelModal",
                mode: "quickReply",
                data: this.replyBtnAry[index]?.valueContent || "",
                channel: this.data.channel,
                index,
            });
        } else this.nbDialogService.open(TemplateDialogComponent);
    }

    /**
     * create Reply Content
     *
     * @memberof ReplyContentComponent
     */
    createReplyContent() {
        if (this.replyBtnAry.length < this.data.countLimit.MAX) {
            this.replyBtnAry.push({
                showText: "",
                option:
                    this.data && this.data.loadData && this.data.loadData.module === "satisfaction-survey-editor"
                        ? "Option"
                        : "QA",
                qaDisplayText: "",
                qaCode: "",
                qaName: "",
                optionDisplayText: "",
                optionCode: "",
                optionName: "",
                urlName: "",
                verify: {
                    showText: this.initVerifyState,
                    qaDisplayText: this.initVerifyState,
                    qaCode: this.initVerifyState,
                    optionDisplayText: this.initVerifyState,
                    optionCode: this.initVerifyState,
                    urlName: this.initVerifyState,
                },
                isShow: true,
                hasEmptyReplyIpt: false,
                id: Math.random().toString(36).substring(7),
                valueContent: "",
            });
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * parse Data
     *
     * @param {*} action
     * @param {*} data
     * @returns
     * @memberof ReplyContentComponent
     */
    parseData(action, data) {
        const dataAry: any = [];
        data.forEach((item) => {
            let dataObj: any;
            switch (action) {
                case "changeToHTMLData":
                    this.qaEditorService.replyContentLabelData[this.data.channel] = item.ValueContent;
                    let qaName: any = "";
                    try {
                        qaName =
                            new Map(JSON.parse(localStorage.getItem("mapSmartQA"))).get(JSON.parse(item.Code).keyId) ||
                            "";
                    } catch (error) {
                        qaName = item.FName || "";
                    }

                    if (this.data.module === "satisfaction-survey-editor") {
                        dataObj = Object.assign(
                            {},
                            {
                                channel: this.data.channel,
                                showText: item.ShowText,
                                option: item.Option,
                                optionDisplayText: item.Option === "Option" ? item.DisplayText || "" : "",
                                optionCode: item.Option === "Option" ? item.BtnV || "" : "",
                                verify: {
                                    showText: this.initVerifyState,
                                    qaDisplayText: this.initVerifyState,
                                    qaCode: this.initVerifyState,
                                    optionDisplayText: this.initVerifyState,
                                    optionCode: this.initVerifyState,
                                    urlName: this.initVerifyState,
                                },
                                isShow: false,
                                hasEmptyReplyIpt: false,
                                id: Math.random().toString(36).substring(7),
                            }
                        );
                    } else {
                        dataObj = Object.assign(
                            {},
                            {
                                channel: this.data.channel,
                                showText: item.ShowText,
                                option: item.Option,
                                qaDisplayText: item.Option === "QA" ? item.DisplayText || "" : "",
                                qaCode: item.Option === "QA" ? (qaName === "" ? "" : item.Code || "") : "",
                                qaName: item.Option === "QA" ? qaName || "" : "",
                                optionDisplayText: item.Option === "Option" ? item.DisplayText || "" : "",
                                optionCode: item.Option === "Option" ? item.Code || "" : "",
                                urlName: item.Option === "Url" ? item.Name || "" : "",
                                verify: {
                                    showText: this.initVerifyState,
                                    qaDisplayText: this.initVerifyState,
                                    qaCode: this.initVerifyState,
                                    optionDisplayText: this.initVerifyState,
                                    optionCode: this.initVerifyState,
                                    urlName: this.initVerifyState,
                                },
                                isShow: false,
                                hasEmptyReplyIpt: false,
                                id: Math.random().toString(36).substring(7),
                                valueContent: item.ValueContent || "",
                            }
                        );
                    }
                    break;
                case "changeToServerData":
                    if (this.data.module === "satisfaction-survey-editor") {
                        const code = {
                            name: item.showText,
                            btnV: item.optionCode,
                            type: "survey",
                            MSId: "MSId",
                        };

                        dataObj = Object.assign(
                            {},
                            {
                                channel: this.data.channel,
                                type: "QuickReply",
                                ShowText: item.showText || "",
                                Option: item.option || "Option",
                                DisplayText: item.optionDisplayText || "",
                                BtnV: item.optionCode,
                                ImageUrl: "",
                                Code: JSON.stringify(code),
                            }
                        );
                    } else {
                        dataObj = Object.assign(
                            {},
                            {
                                channel: this.data.channel,
                                type: "QuickReply",
                                ShowText: item.showText || "",
                                Option: item.option || "QA",
                                DisplayText:
                                    item.option === "QA"
                                        ? item.qaDisplayText
                                        : item.option === "Option"
                                        ? item.optionDisplayText
                                        : "",
                                Code:
                                    item.option === "QA"
                                        ? item.qaCode
                                        : item.option === "Option"
                                        ? item.optionCode
                                        : "",
                                ImageUrl: "",
                                ValueContent: !!item.ValueContent
                                    ? item.valueContent.length === 0
                                        ? ""
                                        : item.valueContent
                                    : "",
                            }
                        );
                    }
                    break;
            }
            dataAry.push(dataObj);
        });
        return dataAry;
    }

    /**
     * open Button
     *
     * @param {*} item
     * @memberof ReplyContentComponent
     */
    openButton(item) {
        const index = this.replyBtnAry.indexOf(item);
        this.replyBtnAry[index].isShow = true;
        this.replyBtnAry[index].hasEmptyReplyIpt = false;
        this.changeDetectorRef.detectChanges();
    }

    /**
     * close Button
     *
     * @param {*} itemId
     * @param {*} fromHTML
     * @memberof ReplyContentComponent
     */
    closeButton(itemId, fromHTML) {
        let index = 0;
        if (this.replyBtnAry.length > 0) {
            this.replyBtnAry.forEach((btnItem, idx) => {
                if (itemId === btnItem.id) {
                    index = idx;
                }
            });

            const item = this.replyBtnAry[index];
            if (
                ((item.option === "QA" && item.qaDisplayText.trim().length !== 0 && item.qaCode.trim().length !== 0) ||
                    (item.option === "Option" &&
                        item.optionCode.trim().length !== 0 &&
                        item.optionDisplayText.trim().length !== 0)) &&
                item.showText.trim().length !== 0
            ) {
                this.replyBtnAry[index].hasEmptyReplyIpt = false;
                this.replyBtnAry[index].isShow = false;
            } else if (
                (item.option === "QA" && (item.qaDisplayText.trim().length !== 0 || item.qaCode.trim().length !== 0)) ||
                (item.option === "Option" &&
                    (item.optionCode.trim().length !== 0 || item.optionDisplayText.trim().length !== 0)) ||
                item.showText.trim().length !== 0
            ) {
                // Some inputs are had value.
                if (fromHTML && !this.isVerify) this.replyBtnAry[index].hasEmptyReplyIpt = false;
                else this.replyBtnAry[index].hasEmptyReplyIpt = true;
                this.replyBtnAry[index].isShow = false;
            } else if (!!this.replyBtnAry[index].valueContent && this.replyBtnAry[index].valueContent.length > 0) {
                this.replyBtnAry[index].hasEmptyReplyIpt = true;
                this.replyBtnAry[index].isShow = false;
            } else this.removeButton(itemId, fromHTML);

            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * remove Button
     *
     * @param {*} itemId
     * @param {*} [fromHTML]
     * @memberof ReplyContentComponent
     */
    removeButton(itemId, fromHTML?) {
        let index = 0;

        this.replyBtnAry.forEach((btnItem, idx) => {
            if (itemId === btnItem.id) {
                index = idx;
            }
        });

        this.replyBtnAry.splice(index, 1);
        this.qaEditorService.replyContentLabelData[this.data.channel].splice(index, 1);
        this.changeDetectorRef.detectChanges();
        this.setResultState();
        this.qaEditorService.clearVerify();
        if (!fromHTML) this.qaEditorService.setIsNeedVerify(true);
    }

    /**
     * ### Drag and Drop快速回覆按鈕
     *
     * @param {CdkDragDrop<string[]>} $event
     * @memberof CardContentComponent
     */
    cdkDropBtn($event: CdkDragDrop<string[]>) {
        const channel = this.data.channel;
        const pIdx = $event.previousIndex;
        const cIdx = $event.currentIndex;
        const replyLabelDataList = this.qaEditorService.replyContentLabelData?.[channel] || [];
        for (const i in this.replyBtnAry) replyLabelDataList[i] = replyLabelDataList[i] || {};

        const elem = replyLabelDataList.splice(pIdx, 1);
        replyLabelDataList.splice(cIdx, 0, elem[0]);

        moveItemInArray(this.replyBtnAry, pIdx, cIdx);
        this.changeDetectorRef.detectChanges();
    }

    /**
     * input Change
     *
     * @param {*} value
     * @param {*} item
     * @param {*} type
     * @memberof ReplyContentComponent
     */
    inputChange(value, item, type) {
        const index = this.replyBtnAry.indexOf(item);
        switch (type) {
            case "displayText":
                switch (item.option) {
                    case "QA":
                        this.replyBtnAry[index].qaDisplayText = value;
                        break;
                    case "Option":
                        this.replyBtnAry[index].optionDisplayText = value;
                        break;
                }
                break;
            case "showText":
                this.replyBtnAry[index].showText = value;
                break;
            case "code":
                switch (item.option) {
                    case "QA":
                        this.replyBtnAry[index].qaCode = value;
                        break;
                    case "Option":
                        this.replyBtnAry[index].optionCode = value;
                        break;
                }
                break;
            case "name":
                this.replyBtnAry[index].urlFName = value;
                break;
        }
    }

    /**
     * append To Component
     *
     * @memberof ReplyContentComponent
     */
    appendToComponent() {
        this.changeDetectorRef.detach();
        const loadData = this.data.loadData || {};
        this.replyBtnAry = this.parseData("changeToHTMLData", loadData.quickReplyItems);
        this.changeDetectorRef.detectChanges();
        this.replyBtnAry.forEach((item) => {
            let option = "";
            switch (item.option) {
                case "QA":
                    option = "Q-A";
                    break;
                case "Option":
                    option = "指令";
                    break;
                case "Url":
                    option = "URL";
            }
            this.changeOption(option, item);
        });
    }

    /**
     * change Option
     *
     * @param {*} value
     * @param {*} item
     * @memberof ReplyContentComponent
     */
    changeOption(value, item) {
        const index = this.replyBtnAry.indexOf(item);
        switch (value) {
            case "Q-A":
                this.replyBtnAry[index].option = "QA";
                break;
            case "指令":
                this.replyBtnAry[index].option = "Option";
                break;
            case "Option":
                this.replyBtnAry[index].option = "Option";
                break;
            case "URL":
                this.replyBtnAry[index].option = "Url";
        }
        this.changeDetectorRef.detectChanges();
    }

    /**
     * set QACode
     *
     * @param {*} value
     * @param {*} id
     * @memberof ReplyContentComponent
     */
    setQACode(value, id) {
        // send Old CBE callback data here to append to UI.
        const data = Object.assign({}, value);
        this.replyBtnAry.forEach((item) => {
            if (item.id === id) {
                data.type = "QA";
                item.qaCode = JSON.stringify(data);
                item.qaName = value.name;
                item.qaDisplayText = value.name;
                this.changeDetectorRef.detectChanges();
            }
        });
        if (this.data.module === "qa-editor") this.smartQaEditorService.clearReplyQAData();
        else {
            this.greetingEditorService.clearReplyQAData();
            this.satisfactionSurveyEditorService.clearReplyQAData();
        }
    }

    /**
     * open SmartQA List
     *
     * @param {*} item
     * @memberof ReplyContentComponent
     */
    openSmartQAList(item) {
        // Here to PostMessage to Old CBE.
        this.postMessageService.postMessage("custom", {
            type: "openSmartQAList",
            id: item.id,
            page:
                this.data.openEditor === "greeting"
                    ? "greetingIFrame"
                    : localStorage.getItem("botType") === "qbipro"
                    ? "qaProIFrame"
                    : "icrIFrame",
        });
    }

    /**
     * Reply Content Component
     *
     * @private
     * @memberof ReplyContentComponent
     */
    private isAllEmpty() {
        let isAllEmptyFlag = true;
        if (!!this.lastResultArr && this.lastResultArr.length > 0) {
            this.lastResultArr.forEach((item) => {
                isAllEmptyFlag = !item.ShowText && !item.DisplayText && !item.Code;

                if (isAllEmptyFlag && !this.qaEditorService.isRequiredVerify)
                    this.qaEditorService.setIsRequiredVerifyState({
                        reply_content_isRequired: false,
                        channel: this.data.channel,
                    });
                else
                    this.qaEditorService.setIsRequiredVerifyState({
                        reply_content_isRequired: true,
                        channel: this.data.channel,
                    });

                if (this.data.channel === "web") {
                    for (const key in this.verifyObj) {
                        if (isAllEmptyFlag && !this.qaEditorService.isRequiredVerify) {
                            if (key === "replyCount") this.verifyObj[key] = ["minBtnCount,0"];
                            else if (!!~this.verifyObj[key].indexOf("isRequired")) this.verifyObj[key].pop();
                        } else {
                            if (key === "replyCount") this.verifyObj[key] = ["minBtnCount,1"];
                            else if (!~this.verifyObj[key].indexOf("isRequired"))
                                this.verifyObj[key].push("isRequired");
                        }
                    }
                }
            });
        } else {
            for (const key in this.verifyObj) {
                // if (!!~this.verifyObj[key].indexOf('isRequired')) this.verifyObj[key].pop();
            }
        }
    }

    /**
     * deep Copy Array Object
     *
     * @param {*} array
     * @returns
     * @memberof ReplyContentComponent
     */
    deepCopyAryObj(array) {
        const copyAry = [];
        if (array.length !== 0) {
            array.forEach((item) => {
                copyAry.push(Object.assign({}, item));
            });
        }
        return copyAry;
    }

    /**
     * verify Form
     *
     * @memberof ReplyContentComponent
     */
    verifyForm() {
        this.isVerify = true;
        this.verifyState = {
            replyCount: this.initVerifyState,
        };

        const copyBtnAry = this.deepCopyAryObj(this.replyBtnAry);
        this.lastResultArr = this.parseData("changeToServerData", this.replyBtnAry);
        if (copyBtnAry.length > 0) {
            for (const item of copyBtnAry) {
                this.closeButton(item.id, false);
            }
        }

        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web")) this.isAllEmpty();
        if (this.replyBtnAry.length !== 0) {
            this.replyBtnAry.forEach((item) => {
                for (const key in item.verify) {
                    item.verify[key] = this.initVerifyState;
                }

                item.verify.showText = this.verifyState[item.id + "_ShowText"] = this.verifyService.verify(
                    item.showText,
                    this.verifyObj.showText
                );
                switch (item.option) {
                    case "QA":
                        if (this.isReplyQaDisplayText) {
                            item.verify.qaDisplayText = this.verifyState[item.id + "_qaDisplayText"] =
                                this.verifyService.verify(item.qaDisplayText, this.verifyObj.qaDisplayText);
                        }
                        item.verify.qaCode = this.verifyState[item.id + "_qaCode"] = this.verifyService.verify(
                            item.qaCode,
                            this.verifyObj.qaCode
                        );
                        break;
                    case "Option":
                        if (this.isReplyQaDisplayText) {
                            item.verify.optionDisplayText = this.verifyState[item.id + "_optionDisplayText"] =
                                this.verifyService.verify(item.optionDisplayText, this.verifyObj.optionDisplayText);
                        }
                        item.verify.optionCode = this.verifyState[item.id + "_optionCode"] = this.verifyService.verify(
                            item.optionCode,
                            this.verifyObj.optionCode
                        );
                        break;
                    case "Url":
                        item.verify.urlName = this.verifyState[item.id + "_url"] = this.verifyService.verify(
                            item.urlName,
                            this.verifyObj.url
                        );
                        break;
                }
                if (Object.values(item.verify).filter((items: any) => items.state === false).length === 0)
                    item.hasEmptyReplyIpt = false;
                else item.hasEmptyReplyIpt = true;
            });
        } else {
            // 智能問答滿意度快速回覆必填
            if (this.data.module === "satisfaction-survey-editor")
                this.verifyState.replyCount = { state: false, errMsg: "請輸入至少一個智能問答滿意度調查項目" };

            if (this.data.channel === this.isGoogleAudio)
                this.verifyState.replyCount = { state: false, errMsg: "請輸入至少一個快速回覆答案" };
        }

        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (!item.state) {
                result = false;
                this.isVerifyStatus = false;
            }
        });
        this.changeDetectorRef.detectChanges();
        this.qaEditorService.setVerifyState({
            id: this.data.id,
            state: result,
            channel: this.data.channel,
            component: "reply-content",
        });
    }

    /**
     * set Result State
     *
     * @memberof ReplyContentComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        const channel = this.data.channel;
        let result = this.replyContentObj.result || {};
        result[channel] = result[channel] || {};

        let resultArr = [];
        const objIdx = this.data.id + "_" + this.data.index;
        const isEmpty = [];
        if (Object.keys(this.replyBtnAry).length > 0) {
            resultArr = this.parseData("changeToServerData", this.replyBtnAry);
            resultArr.forEach((item, index) => {
                if (
                    this.data.module === "satisfaction-survey-editor" &&
                    !item.BtnV &&
                    !item.DisplayText &&
                    !item.ImageUrl &&
                    !item.ShowText
                )
                    isEmpty.push(index);
                else if (!item.Code && !item.DisplayText && !item.ImageUrl && !item.ShowText) isEmpty.push(index);
            });
            this.lastResultArr = resultArr;
        }
        result = Object.assign(result);
        if (
            !!this.qaEditorService.replyContentLabelData[this.data.channel] &&
            this.qaEditorService.replyContentLabelData[this.data.channel].length > 0
        ) {
            this.qaEditorService.replyContentLabelData[this.data.channel].forEach((item, index) => {
                if (!resultArr[index]) {
                    const ValueContent = {
                        ValueContent: "",
                    };
                    ValueContent.ValueContent = item;
                    if (!!this.replyBtnAry[index]) this.replyBtnAry[index].valueContent = item;
                } else if (resultArr[index].Option === "QA") {
                    if (!!resultArr[index].Code && resultArr[index].Code.length > 0) {
                        try {
                            const parseCode = JSON.parse(resultArr[index].Code);
                            if (item.length === 0) delete parseCode.label;
                            else if (!Object.keys(item).length) delete parseCode.label;
                            else parseCode.label = item;
                            resultArr[index].Code = JSON.stringify(parseCode);
                        } catch (e) {}
                    }
                    this.replyBtnAry[index].valueContent = resultArr[index].ValueContent = item;
                    this.changeDetectorRef.detectChanges();
                } else {
                    resultArr[index].ValueContent = "";
                }
            });
        }

        if (isEmpty.length === resultArr.length) result[channel] = {};
        else if (!!resultArr) result[channel][objIdx] = resultArr;
        else result[channel] = {};

        this.replyContentService.setState({
            data: { result },
        });
    }

    ngOnInit(): void {
        this.data.stateObject = this.qaEditorService.stateObject;

        this.ReplyContentState = this.replyContentService.replyContentState$.subscribe((resp) => {
            this.replyContentObj = resp.data || {};
        });

        this.subIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.verifyForm();
        });

        this.subIsClearReplyAry = this.replyContentService.isClearReplyAry$.subscribe((resp) => {
            if (resp) {
                this.replyBtnAry = [];
                this.changeDetectorRef.detectChanges();
                this.replyContentService.setIsClearReplyAry(false);
            }
        });

        this.subReplyQAData = this.smartQaEditorService.replyQAData$.subscribe((resp) => {
            if (resp.length > 0) this.setQACode(resp[0], resp[1]);
        });

        this.subGreetingReplyQAData = this.greetingEditorService.replyQAData$.subscribe((resp) => {
            if (resp.length > 0) this.setQACode(resp[0], resp[1]);
        });

        this.subSatisfactionSurveyReplyQAData = this.satisfactionSurveyEditorService.replyQAData$.subscribe((resp) => {
            if (resp.length > 0) this.setQACode(resp[0], resp[1]);
        });

        this.subIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
            if (resp && !this.isOninit) this.verifyForm();
        });

        // Processing data from load api
        if (
            !!this.data.loadData &&
            this.data.loadData.quickReplyItems &&
            this.data.loadData.quickReplyItems.length > 0
        ) {
            this.isLoad = true;
            if (!!~this.data.channel.indexOf("google"))
                this.data.loadData.quickReplyItems = this.data.loadData.quickReplyItems.slice(0, 8);

            this.appendToComponent();
        }

        this.parseValueContentFromloadData();
        this.setResultState();
        this.isOninit = false;

        this.googleAudioState = this.qaEditorService.isGoogleAudio$.subscribe((resp) => {
            this.isGoogleAudio = resp || "";
        });

        const channel = this.data.channel.split("_")[0];
        this.isReplyQaDisplayText = !~["messenger", "google", "instagram"].indexOf(channel);
    }

    ngAfterViewChecked() {
        this.setResultState();
    }

    parseValueContentFromloadData(): void {
        const valueContent = [];
        if (!!this.data.loadData && this.data.loadData?.quickReplyItems?.length > 0) {
            this.data.loadData.quickReplyItems.forEach((item) => {
                valueContent.push(item.ValueContent);
            });
        }
        this.qaEditorService.replyContentLabelData[this.data.channel] = valueContent;
    }

    ngOnDestroy(): void {
        if (!!this.ReplyContentState) this.ReplyContentState.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
        if (!!this.subReplyQAData) this.subReplyQAData.unsubscribe();
        if (!!this.subGreetingReplyQAData) this.subGreetingReplyQAData.unsubscribe();
        if (!!this.subIsClearReplyAry) this.subIsClearReplyAry.unsubscribe();
        if (!!this.subSatisfactionSurveyReplyQAData) this.subSatisfactionSurveyReplyQAData.unsubscribe();
        if (!!this.googleAudioState) this.googleAudioState.unsubscribe();
    }
}
