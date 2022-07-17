import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import {
    CardContentService,
    QaEditorService,
    SmartQaEditorService,
    QaCardService,
    GreetingEditorService,
} from "@core/state";
import { NbDialogService } from "@nebular/theme";
import { GlobalService, VerifyService, SET_TIMEOUT } from "@core/services";
import { ReplyContentLoaderDirective } from "@shared/directives/reply-content-loader.directive";
import { IAnsCardContentJson } from "@core/state/qa-editor/answer-json.interface";
import { CropperDialogComponent } from "@shared/components/dialog/cropper-dialog/cropper-dialog.component";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { environment } from "@env/environment";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
/**
 * CARD CONTENT 的基本常數設定
 *
 * @enum {number}
 */
enum REPLY_QTY {
    MIN = 1,
    MAX = 3,
    GOOGLE_MIN = 1,
    GOOGLE_MAX = 1,
}

/**
 * Card Content Component
 *
 * @export
 * @class CardContentComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-card-content",
    templateUrl: "./card-content.component.html",
    styleUrls: ["./card-content.component.scss"],
})
export class CardContentComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private nbDialogService: NbDialogService,
        private cardContentService: CardContentService,
        private qaCardService: QaCardService,
        private verifyService: VerifyService,
        private qaEditorService: QaEditorService,
        private changeDetectorRef: ChangeDetectorRef,
        private globalService: GlobalService,
        private smartQaEditorService: SmartQaEditorService,
        private postMessageService: PostMessageService,
        private utilitiesService: UtilitiesService,
        private languageService: LanguageService,
        private greetingEditorService: GreetingEditorService
    ) {
        this.i18n.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        this.imageSelectList = [
            {
                value: "url",
                name: this.i18n.QA_EDITOR.IMAGE.IMAGE_URL,
            },
            {
                value: "upload",
                name: this.i18n.QA_EDITOR.IMAGE.IMAGE_UPLOAD,
            },
        ];

        this.videoSelectList = [
            {
                value: "url",
                name: this.i18n.QA_EDITOR.VIDEO.VIDEO_URL,
            },
            {
                value: "upload",
                name: this.i18n.QA_EDITOR.VIDEO.VIDEO_UPLOAD,
            },
        ];
    }

    subReplyQAData: any;

    @ViewChild("body") body: ElementRef;
    @ViewChild(ReplyContentLoaderDirective, { static: true })
    cbeSharedReplyContentLoader: ReplyContentLoaderDirective;
    @ViewChild("file") file: ElementRef<HTMLElement>;
    @ViewChild("text") text: ElementRef<HTMLElement>;
    @ViewChild("textHint") textHint: ElementRef<HTMLElement>;
    @ViewChild("imageClickUrl") imageClickUrl: ElementRef<HTMLElement>;
    @ViewChild("title") title: ElementRef<HTMLElement>;
    @ViewChild("FMsgAnswer") FMsgAnswer: ElementRef<HTMLElement>;

    @Input() data: any;

    i18n = JSON.parse(localStorage.getItem("languages"));

    QA_EDITOR: any;

    isLoad = false;

    isOninit: boolean = false;

    globalService$: any;

    globalData: any;

    REPLY_QTY_MIN: number = REPLY_QTY.MIN;

    REPLY_QTY_MAX: number = REPLY_QTY.MAX;

    id: string;

    viewContainerRef: any;

    cardPicState: any;

    CardContentState: any;

    cardContentObj: any;

    CardContentMove: any;

    ImageAspectRatio: any;

    replyContentObj: any = {};

    fileListObj: any = {};

    imgFileListObj: any = {};

    videoFileListObj: any = {};

    uploadFrameBg = "";

    imgUploadFrameBg = "";

    videoUploadFrameBg = "";

    imageAcceptFileType = ".jpg,.jpeg,.png";

    videoAcceptFileType = ".mp4";

    acceptFileType: string = this.imageAcceptFileType;

    imgRatio = "rectangle";

    fbId: string = "";

    // ----- Only For MediaCard Start-----

    // view type  - image or video
    mediaType: string = "image";

    // file position :url / upload
    mediaMode: string = "url";

    videoMode: string = "url";

    imageMode: string = "url";

    videoUrl: string = "";

    imageUrl: string = "";

    imageSelectList: any = [];

    videoSelectList = [];

    // ----- Only For MediaCard End-----
    url: string = "";

    subIsNeedVerify: any;

    subIsSave: any;

    subCardPicState: any;

    subGreetingReplyQAData: any;

    videoName: string = "";

    URL = window.URL || window.webkitURL;

    initVerifyState: any = { errMsg: "", state: true };

    verifyState: any = {
        title: this.initVerifyState,
        imageClickUrl: this.initVerifyState,
        text: this.initVerifyState,
        textHint: this.initVerifyState,
        mediaCardUrl: this.initVerifyState,
        mediaCardUpload: this.initVerifyState,
        replyCount: this.initVerifyState,
        FShowText: this.initVerifyState,
        qaDisplayText: this.initVerifyState,
        qaCode: this.initVerifyState,
        optionDisplayText: this.initVerifyState,
        optionCode: this.initVerifyState,
        url: this.initVerifyState,
        cardNumber: this.initVerifyState,
        cardUpload: this.initVerifyState,
        FMsgAnswer: this.initVerifyState,
    };

    verifyObj = {
        replyCount: ["minBtnCount,1"],
        mediaCardUrl: ["isFbUrl", "maxLength,1000", "isRequired"],
        mediaCardImgUpload: ["maxSize,1", "isRequired"],
        text: ["maxLength,40", "isRequired"],
        textHint: ["maxLength,40", "isRequired"],
        cardTitle: ["maxLength,40", "isRequired"],
        mediaCardVideoUpload: ["maxSize,10", "isRequired"],
        cardFMsgAnswer: ["maxLength,60"],
        cardImageClickUrl: ["hasHTTPS", "maxLength,1000", "isRequired"],
        showText: ["maxLength,20", "isRequired"],
        qaDisplayText: ["maxLength,100", "isRequired"],
        qaCode: ["maxLength,300", "isRequired"],
        optionCode: ["maxLength,300", "isRequired"],
        optionDisplayText: ["maxLength,100", "isRequired"],
        url: ["hasHTTPS", "maxLength,1000", "isRequired"],
        cardNumber: ["minCardCount,2"],
        cardUpload: ["maxSize,1", "isRequired"],
    };

    lastResultObj: any;

    // REPLY-BTN-------------------------

    replyBtnAry: any = [];

    replyContentStatus = true;

    isVerify: boolean = false;

    isReplyQaDisplayText = true;

    isLine = false;

    isGoogle = false;

    cardSubtitle = "";

    onPricetagsClick(index) {
        if (!!~environment.env.indexOf("stage")) {
            this.postMessageService.postMessage("custom", {
                type: "showLabelModal",
                mode: "card",
                data: this.replyBtnAry[index]?.valueContent || "",
                channel: this.data.channel,
                componentId: this.id,
                index,
            });
        }
    }

    /**
     * isAllEmpty
     *
     * @private
     * @memberof CardContentComponent
     */
    private isAllEmpty() {
        let isAllEmptyFlag = true;
        switch (this.data.type) {
            case "MediaCard":
                isAllEmptyFlag =
                    !this.lastResultObj.originalContentUrl &&
                    !this.lastResultObj.gWUploadFormData &&
                    this.lastResultObj.FQACardAnswer &&
                    this.lastResultObj.FQACardAnswer.length === 0;
                break;
            case "Cards":
                isAllEmptyFlag =
                    !this.lastResultObj.FMsgAnswer &&
                    !this.lastResultObj.imageClickUrl &&
                    !this.lastResultObj.thumbnailImageUrl &&
                    !this.lastResultObj.title &&
                    !this.lastResultObj.originalContentUrl &&
                    !this.lastResultObj.gWUploadFormData &&
                    this.lastResultObj.FQACardAnswer &&
                    this.lastResultObj.FQACardAnswer.length === 0;
                break;
        }

        if (this.lastResultObj.FQACardAnswer && this.lastResultObj.FQACardAnswer.length !== 0) {
            this.lastResultObj.FQACardAnswer.forEach((item) => {
                if (
                    (item.Option === "Url" && item.FName !== "" && item.FShowText !== "") ||
                    (item.FName !== "" && item.FShowText !== "" && item.FCode !== "" && item.FDisplayText !== "")
                )
                    isAllEmptyFlag = false;
            });
        }

        if (isAllEmptyFlag)
            this.qaEditorService.setIsRequiredVerifyState({
                card_content_isRequired: false,
                channel: this.data.channel,
            });
        else
            this.qaEditorService.setIsRequiredVerifyState({
                card_content_isRequired: true,
                channel: this.data.channel,
            });

        if (this.data.channel === "web") {
            for (const key in this.verifyObj) {
                if (isAllEmptyFlag && !this.qaEditorService.isRequiredVerify) {
                    if (!!~this.verifyObj[key].indexOf("isRequired")) this.verifyObj[key].pop();
                    if (key === "replyCount") this.verifyObj[key] = ["minBtnCount,0"];
                } else {
                    if (!~this.verifyObj[key].indexOf("isRequired") && key !== "cardFMsgAnswer")
                        this.verifyObj[key].push("isRequired");
                    if (key === "replyCount") this.verifyObj[key] = ["minBtnCount,1"];
                }
            }
        }
    }

    /**
     * deepCopyAryObj
     *
     * @param {*} array
     * @returns
     * @memberof CardContentComponent
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
     * verifyForm
     *
     * @memberof CardContentComponent
     */
    verifyForm() {
        this.isVerify = true;
        this.verifyState = {
            title: this.initVerifyState,
            imageClickUrl: this.initVerifyState,
            text: this.initVerifyState,
            textHint: this.initVerifyState,
            FMsgAnswer: this.initVerifyState,
            mediaCardUrl: this.initVerifyState,
            cardUpload: this.initVerifyState,
            mediaCardUpload: this.initVerifyState,
            replyCount: this.initVerifyState,
            cardNumber: this.initVerifyState,
        };

        // reply-btn verify.
        this.verifyObj.replyCount = [`minBtnCount,${this.REPLY_QTY_MIN}`];

        const copyBtnAry = this.deepCopyAryObj(this.replyBtnAry);
        if (copyBtnAry.length > 0) {
            for (const item of copyBtnAry) {
                this.closeButton(item.id, false);
            }
        }

        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web") && !!this.lastResultObj)
            this.isAllEmpty();

        if (this.replyBtnAry.length !== 0) {
            this.replyBtnAry.forEach((item) => {
                for (const key in item.verify) {
                    item.verify[key] = this.initVerifyState;
                }

                item.verify.FShowText = this.verifyState[item.id + "_FShowText"] = this.verifyService.verify(
                    item.FShowText,
                    this.verifyObj.showText
                );
                switch (item.Option) {
                    case "QA":
                        if (this.isReplyQaDisplayText) {
                            item.verify.qaFDisplayText = this.verifyState[item.id + "_qaDisplayText"] =
                                this.verifyService.verify(item.qaFDisplayText, this.verifyObj.qaDisplayText);
                        }
                        item.verify.qaFCode = this.verifyState[item.id + "_qaCode"] = this.verifyService.verify(
                            item.qaFCode,
                            this.verifyObj.qaCode
                        );
                        break;
                    case "Option":
                        if (this.isReplyQaDisplayText) {
                            item.verify.optionFDisplayText = this.verifyState[item.id + "_optionDisplayText"] =
                                this.verifyService.verify(item.optionFDisplayText, this.verifyObj.optionDisplayText);
                        }
                        item.verify.optionFCode = this.verifyState[item.id + "_optionCode"] = this.verifyService.verify(
                            item.optionFCode,
                            this.verifyObj.optionCode
                        );
                        break;
                    case "Url":
                        item.verify.urlFName = this.verifyState[item.id + "_url"] = this.verifyService.verify(
                            item.urlFName,
                            this.verifyObj.url
                        );
                        break;
                }
                if (Object.values(item.verify).filter((items: any) => items.state === false).length === 0)
                    item.hasEmptyReplyIpt = false;
                else item.hasEmptyReplyIpt = true;
            });
        }

        let fileSize = "";
        if (Object.keys(this.fileListObj).length === 0) fileSize = "";
        else fileSize = (this.fileListObj[0].size / 1024 / 1024).toString(); // Unit : MB

        this.verifyState["replyCount"] = this.verifyService.verify(
            this.lastResultObj && this.lastResultObj !== "" && this.lastResultObj.FQACardAnswer
                ? this.lastResultObj.FQACardAnswer.length.toString()
                : "0",
            this.verifyObj.replyCount
        );

        switch (this.data.type) {
            case "MediaCard":
                if (this.mediaMode === "url")
                    this.verifyState["mediaCardUrl"] = this.verifyService.verify(this.url, this.verifyObj.mediaCardUrl);
                else {
                    if (this.mediaType === "image")
                        this.verifyState["mediaCardUpload"] = this.verifyService.verify(
                            fileSize,
                            this.verifyObj.mediaCardImgUpload
                        );
                    else
                        this.verifyState["mediaCardUpload"] = this.verifyService.verify(
                            fileSize,
                            this.verifyObj.mediaCardVideoUpload
                        );
                }
                break;
            case "Cards":
                let title = "";
                if (!!this.title) title = (this.title.nativeElement as HTMLInputElement).value;

                let FMsgAnswer = "";
                if (!!this.FMsgAnswer) FMsgAnswer = (this.FMsgAnswer.nativeElement as HTMLInputElement).value;

                let imageClickUrl = "";
                if (!!this.imageClickUrl) imageClickUrl = (this.imageClickUrl.nativeElement as HTMLInputElement).value;

                this.verifyState["FMsgAnswer"] = this.verifyService.verify(FMsgAnswer, this.verifyObj.cardFMsgAnswer);

                // Line通道卡片專屬邏輯
                this.lineRules(FMsgAnswer);

                // Google通道卡片專屬邏輯
                this.googleRules(fileSize, FMsgAnswer, title);

                if (imageClickUrl.trim().length !== 0) {
                    this.verifyState["imageClickUrl"] = this.verifyService.verify(
                        imageClickUrl,
                        this.verifyObj.cardImageClickUrl
                    );
                    this.verifyObj.cardUpload = ["maxSize,1", "isRequired"];
                    this.verifyState["cardUpload"] = this.verifyService.verify(fileSize, this.verifyObj.cardUpload);
                } else {
                    if (this.verifyState["cardUpload"].state || this.verifyState["FMsgAnswer"].state) {
                        if (this.cardPicState && this.cardPicState[this.data.id]) {
                            let isHasPic: boolean = false;
                            this.cardPicState[this.data.id].forEach((item) => {
                                if (item.hasPic) isHasPic = true;
                            });
                            if (isHasPic) {
                                if (this.verifyObj.cardUpload.indexOf("isRequired") === -1)
                                    this.verifyObj.cardUpload.push("isRequired");
                                this.verifyState["cardUpload"] = this.verifyService.verify(
                                    fileSize,
                                    this.verifyObj.cardUpload
                                );
                            } else {
                                if (this.verifyObj.cardUpload.indexOf("isRequired") !== -1)
                                    this.verifyObj.cardUpload.pop();
                                this.verifyState["cardUpload"] = this.verifyService.verify(
                                    fileSize,
                                    this.verifyObj.cardUpload
                                );
                                this.verifyState["cardUpload"] = this.initVerifyState;
                                this.verifyState["imageClickUrl"] = this.initVerifyState;
                            }
                        }
                    }
                }

                break;
        }

        let result: boolean = true;
        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });

        this.qaEditorService.setVerifyState({
            id: this.id,
            state: result,
            channel: this.data.channel,
            component: "card-content",
        });
    }

    /**
     * ### Line通道卡片專屬邏輯
     *
     * @private
     * @param {string} FMsgAnswer
     * @memberof CardContentComponent
     */
    private lineRules(FMsgAnswer: string) {
        const isFMsgAnswerRequired = this.verifyObj.cardFMsgAnswer.indexOf("isRequired");
        if (this.isLine) {
            let isRequired = false;
            const qaCardObj = this.data.stateObject.qaCardObj.result;
            for (const key in qaCardObj) {
                if (qaCardObj[key].channel === this.data.channel) {
                    const fQACardColumn = qaCardObj[key]["FQACardColumn"];
                    isRequired = isRequired || fQACardColumn.some((x) => !!("" + x.FMsgAnswer));
                    isRequired = isRequired && !fQACardColumn.every((x) => !!("" + x.FMsgAnswer));
                }
            }

            if (isRequired && !~isFMsgAnswerRequired) {
                this.verifyObj.cardFMsgAnswer.push("isRequired");
                this.verifyState["FMsgAnswer"] = this.verifyService.verify(FMsgAnswer, this.verifyObj.cardFMsgAnswer);
                this.verifyState["FMsgAnswer"].errMsg = this.i18n.VERIFY_SERVICE.LINE_CARD_SUBTITLE;
            } else if (!isRequired && !!~isFMsgAnswerRequired) {
                this.verifyObj.cardFMsgAnswer.splice(isFMsgAnswerRequired, 1);
                this.verifyState["FMsgAnswer"] = this.verifyService.verify(FMsgAnswer, this.verifyObj.cardFMsgAnswer);
            }
        } else if (!!~isFMsgAnswerRequired) {
            this.verifyObj.cardFMsgAnswer.splice(isFMsgAnswerRequired, 1);
            this.verifyState["FMsgAnswer"] = this.verifyService.verify(FMsgAnswer, this.verifyObj.cardFMsgAnswer);
        }
    }

    /**
     * ### Google通道卡片專屬邏輯
     *
     * @private
     * @param {string} fileSize
     * @param {string} FMsgAnswer
     * @param {string} title
     * @memberof CardContentComponent
     */
    private googleRules(fileSize: string, FMsgAnswer: string, title: string) {
        if (this.isGoogle) {
            this.verifyState["text"] = this.verifyService.verify(
                (this.text.nativeElement as HTMLInputElement).value,
                this.verifyObj.text
            );

            this.verifyState["textHint"] = this.verifyService.verify(
                (this.textHint.nativeElement as HTMLInputElement).value,
                this.verifyObj.textHint
            );

            // Google通道至少新增2張卡片
            const qaCardObj = this.data.stateObject.qaCardObj.result;
            let key = "";
            for (const i in qaCardObj) {
                if (qaCardObj[i].channel === this.data.channel) key = i;
                if (!!key && qaCardObj[key]["FQACardColumn"].length < 2) {
                    this.verifyState["cardNumber"] = this.verifyService.verify(qaCardObj[key]["FQACardColumn"].length, [
                        "minCardCount,2",
                    ]);
                }
            }

            // Google通道圖片與卡片說明文字擇一必填
            this.verifyObj.cardUpload = ["isRequired"];
            this.verifyState["cardUpload"] = this.verifyService.verify(fileSize, this.verifyObj.cardUpload);
            this.verifyObj.cardFMsgAnswer = ["isRequired"];
            this.verifyState["FMsgAnswer"] = this.verifyService.verify(FMsgAnswer, this.verifyObj.cardFMsgAnswer);

            if (!this.verifyState["cardUpload"].state && !this.verifyState["FMsgAnswer"].state) {
                this.verifyState["cardUpload"].errMsg = this.i18n.VERIFY_SERVICE.GOOGLE_CARD_FILE;
                this.verifyState["FMsgAnswer"].errMsg = this.i18n.VERIFY_SERVICE.GOOGLE_CARD_SUBTITLE;
            } else {
                this.verifyObj.cardUpload = ["maxSize,1"];
                this.verifyState["cardUpload"] = this.verifyService.verify(fileSize, this.verifyObj.cardUpload);
                this.verifyObj.cardFMsgAnswer = ["maxLength,60"];
                this.verifyState["FMsgAnswer"] = this.verifyService.verify(FMsgAnswer, this.verifyObj.cardFMsgAnswer);
            }
        } else this.verifyState["title"] = this.verifyService.verify(title, this.verifyObj.cardTitle);
    }

    /**
     * 取得 verifyObj 的大小限制
     *
     * @param {*} $event
     * @param {string} [mode='']
     * @memberof CardContentComponent
     */
    getSizeLimit(mode, key) {
        let result;
        if (this.verifyObj[mode] && this.verifyObj[mode].length > 0) {
            this.verifyObj[mode].forEach((item) => {
                if (!!~item.indexOf(key)) {
                    result = Number(item.split(",")[1]);
                }
            });
        }
        return result;
    }

    /**
     * imageUploadEvent
     *
     * @param {*} $event
     * @param {string} [mode='']
     * @memberof CardContentComponent
     */
    imageUploadEvent($event: any, mode = ""): void {
        if (!!$event.target.value && this.mediaType !== "video") {
            const filePath = $event.target.value;
            const filePathArr = filePath.split(".");
            const imageFormat = filePathArr[filePathArr.length - 1];
            const fileInfo = $event.target.files[0];

            if (!!~this.acceptFileType.indexOf(imageFormat.toLowerCase())) {
                let isCanUpload = true;
                switch (mode) {
                    case "mediaCard":
                        const mediaCardLimitMaxSize = this.getSizeLimit("mediaCardImgUpload", "maxSize");
                        if (mediaCardLimitMaxSize && mediaCardLimitMaxSize < fileInfo.size / 1024 / 1024)
                            isCanUpload = false;
                        break;
                    case "card":
                        const imgLimitMaxSize = this.getSizeLimit("cardUpload", "maxSize");
                        if (imgLimitMaxSize && imgLimitMaxSize < fileInfo.size / 1024 / 1024) isCanUpload = false;
                        break;
                }
                if (isCanUpload) {
                    this.nbDialogService
                        .open(CropperDialogComponent, {
                            context: {
                                imageFiles: $event.target.files[0],
                                componentType: "CardImage",
                            },
                        })
                        .onClose.subscribe((dialogResp) => {
                            if (!!dialogResp && dialogResp.action === "confirm") {
                                this.imageUpload($event, dialogResp.croppedImage, mode);
                            } else if (!!dialogResp && dialogResp.action === "reset") {
                                $event.target.value = "";
                                const el: HTMLElement = this.file.nativeElement;
                                el.click();
                            } else $event.target.value = "";
                        });
                } else {
                    this.postMessageService.postMessage("showUploadMaxError");
                    $event.target.value = "";
                    console.debug("檔案過大，請重新上傳");
                }
            } else {
                $event.target.value = "";
                this.postMessageService.postMessage("showNotSupportError");
                console.debug("格式不相符，請重新上傳");
            }
        } else if (!!$event.target.value && this.mediaType === "video") this.videoUpload($event);
    }

    /**
     * videoUpload
     *
     * @param {*} [$event=null]
     * @memberof CardContentComponent
     */
    videoUpload($event = null) {
        console.log($event);

        const files = Object.assign({}, $event.target.files || {});

        const videoName = files[0].name || "";
        const splitFileName = videoName.split(".");
        const subFileName = splitFileName[splitFileName.length - 1];
        const fileInfo = $event.target.files[0];

        if (!!~this.acceptFileType.indexOf(subFileName.toLowerCase())) {
            const mediaCardLimitMaxSize = this.getSizeLimit("mediaCardVideoUpload", "maxSize");
            if (mediaCardLimitMaxSize && mediaCardLimitMaxSize < fileInfo.size / 1024 / 1024) {
                this.postMessageService.postMessage("showUploadMaxError");
                $event.target.value = "";
                console.debug("檔案過大，請重新上傳");
            } else {
                this.videoName = videoName;
                const reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onload = () => {
                    files[0].src = reader.result;
                    const formData = new FormData();
                    const blob = this.utilitiesService.base64ToFile(files[0].src);
                    formData.append("file", blob, this.videoName);
                    formData.append(
                        "args",
                        JSON.stringify({
                            directory: this.data.module === "qa-editor" ? "smartqa" : "greeting",
                            tenantId: localStorage.getItem("tenantId"),
                            _header_: {
                                tokenId: this.utilitiesService.getCookie("tkn"),
                            },
                        })
                    );
                    files[0].formData = formData;
                    this.file.nativeElement["value"] = "";
                };

                this.videoFileListObj = this.fileListObj = files;
                this.videoUploadFrameBg = this.uploadFrameBg = this.url = this.URL.createObjectURL(files[0]);
            }
        } else {
            this.file.nativeElement["value"] = "";
            this.postMessageService.postMessage("showNotSupportError");
            console.debug("格式不相符，請重新上傳");
        }
    }

    /**
     * imageUpload
     *
     * @param {*} [$event=null]
     * @param {*} [croppedImage=null]
     * @param {string} [mode='']
     * @memberof CardContentComponent
     */
    imageUpload($event = null, croppedImage = null, mode = "") {
        // send upload image form data
        const files = Object.assign({}, $event.target.files || {});
        const fileName = files[0].name;
        const formData = new FormData();
        formData.append("file", croppedImage.blob, fileName);
        formData.append(
            "args",
            JSON.stringify({
                directory: this.data.module === "qa-editor" ? "smartqa" : "greeting",
                tenantId: localStorage.getItem("tenantId"),
                _header_: {
                    tokenId: this.utilitiesService.getCookie("tkn"),
                },
            })
        );
        files[0].src = croppedImage.dataUrl;
        files[0].width = croppedImage.width;
        files[0].height = croppedImage.height;
        files[0].formData = formData;

        this.fileListObj = files;

        this.url = this.URL.createObjectURL(files[0]);

        switch (this.data.type) {
            case "MediaCard":
                this.imgFileListObj = files;
                this.uploadFrameBg = this.imgUploadFrameBg = croppedImage.blobUrl;
                break;
            case "Cards":
                this.uploadFrameBg = croppedImage.blobUrl;
                break;
        }

        this.file.nativeElement["value"] = "";
        this.setResultState();
    }

    /**
     * uploadRemove
     *
     * @param {*} evt
     * @memberof CardContentComponent
     */
    uploadRemove(evt) {
        evt.stopPropagation();
        this.file.nativeElement["value"] = "";
        this.url = this.uploadFrameBg = "";
        this.fileListObj = this.imgFileListObj = {};
    }

    /**
     * parseData
     *
     * @param {*} action
     * @param {*} data
     * @returns
     * @memberof CardContentComponent
     */
    parseData(action, data) {
        const dataAry: any = [];
        data.forEach((item) => {
            let dataObj: any;
            switch (action) {
                case "changeToHTMLData":
                    let qaName: any = "";
                    try {
                        qaName =
                            new Map(JSON.parse(localStorage.getItem("mapSmartQA"))).get(JSON.parse(item.FCode).keyId) ||
                            "";
                    } catch (exception) {
                        qaName = item.FName || "";
                    }

                    dataObj = Object.assign(
                        {},
                        {
                            FShowText: item.FShowText,
                            Option: item.Option,
                            qaFDisplayText: item.Option === "QA" ? item.FDisplayText || "" : "",
                            qaFCode: item.Option === "QA" ? (qaName === "" ? "" : item.FCode || "") : "",
                            qaFName: item.Option === "QA" ? qaName || "" : "",
                            optionFDisplayText: item.Option === "Option" ? item.FDisplayText || "" : "",
                            optionFCode: item.Option === "Option" ? item.FCode || "" : "",
                            optionFName: item.Option === "Option" ? item.FName || "" : "",
                            urlFName: item.Option === "Url" ? item.FName || "" : "",
                            verify: {
                                FShowText: this.initVerifyState,
                                qaFDisplayText: this.initVerifyState,
                                qaFCode: this.initVerifyState,
                                optionFDisplayText: this.initVerifyState,
                                optionFCode: this.initVerifyState,
                                urlFName: this.initVerifyState,
                            },
                            isShow: false,
                            hasEmptyReplyIpt: false,
                            id: Math.random().toString(36).substring(7),
                            valueContent: item.ValueContent || "",
                        }
                    );
                    break;
                case "changeToServerData":
                    if (
                        (item.Option === "QA" ? item.qaFCode : item.Option === "Option" ? item.optionFCode : false) ||
                        (item.Option === "QA"
                            ? item.qaFDisplayText
                            : item.Option === "Option"
                            ? item.optionFDisplayText
                            : false) ||
                        (item.Option === "QA"
                            ? item.qaFName
                            : item.Option === "Option"
                            ? item.optionFCode
                            : item.urlFName) ||
                        item.FShowText
                    )
                        dataObj = Object.assign(
                            {},
                            {
                                FCode:
                                    item.Option === "QA"
                                        ? item.qaFCode
                                        : item.Option === "Option"
                                        ? item.optionFCode
                                        : "",
                                FDisplayText:
                                    item.Option === "QA"
                                        ? item.qaFDisplayText
                                        : item.Option === "Option"
                                        ? item.optionFDisplayText
                                        : "",
                                FName:
                                    item.Option === "QA"
                                        ? item.qaFName
                                        : item.Option === "Option"
                                        ? item.optionFCode
                                        : item.urlFName,
                                FShowText: item.FShowText || "",
                                Option: item.Option || "QA",
                                ValueContent:
                                    item.Option === "Url"
                                        ? ""
                                        : !!item.valueContent
                                        ? item.valueContent.length === 0
                                            ? ""
                                            : item.valueContent
                                        : "",
                            }
                        );
                    break;
            }
            if (dataObj) dataAry.push(dataObj);
        });
        return dataAry;
    }

    /**
     * appendToComponent
     *
     * @memberof CardContentComponent
     */
    appendToComponent() {
        this.changeDetectorRef.detach();
        const loadData = this.data.loadData;
        this.replyBtnAry = this.parseData("changeToHTMLData", loadData.FQACardAnswer);
        const cardContent = Object.assign({});
        this.replyBtnAry.forEach((item, index) => {
            let option = "";
            switch (item.Option) {
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

        switch (loadData.type) {
            case "Cards":
                if (!!this.imageClickUrl)
                    (this.imageClickUrl.nativeElement as HTMLInputElement).value = loadData.imageClickUrl;
                if (!!this.title) (this.title.nativeElement as HTMLTextAreaElement).value = loadData.title;
                if (!!this.text) (this.text.nativeElement as HTMLTextAreaElement).value = loadData.textToSpeech;
                if (!!this.textHint) (this.textHint.nativeElement as HTMLTextAreaElement).value = loadData.imgHint;

                if (!!this.FMsgAnswer)
                    (this.FMsgAnswer.nativeElement as HTMLTextAreaElement).value = loadData.FMsgAnswer;

                this.url = this.uploadFrameBg = loadData.thumbnailImageUrl;

                if (loadData.thumbnailImageUrl) {
                    this.fileListObj = {
                        0: {
                            size: 1,
                            formData: loadData.gWUploadFormData || "",
                        },
                    };
                }

                break;
            case "MediaCard":
                this.mediaType = loadData.mediaType;
                const fileObj = {
                    0: {
                        size: loadData.size || 1,
                        name: loadData.name || "",
                        formData: loadData.gWUploadFormData || "",
                    },
                };
                this.fbId = loadData.fbId || "";

                if (loadData.mediaType === "image") {
                    this.imgFileListObj = this.fileListObj;

                    setTimeout(() => {
                        this.mediaMode = loadData.mediaMode;
                        this.imageMode = loadData.mediaMode;
                    }, SET_TIMEOUT.EXTREMELY);

                    this.url = loadData.originalContentUrl;
                    this.acceptFileType = this.imageAcceptFileType;

                    if (loadData.mediaMode === "url") this.imageUrl = loadData.originalContentUrl;
                    else {
                        if (loadData.originalContentUrl) {
                            this.uploadFrameBg = this.imgUploadFrameBg = loadData.originalContentUrl;
                            this.imgFileListObj = this.fileListObj = fileObj;
                        }
                    }
                } else {
                    this.videoName = loadData.name;

                    setTimeout(() => {
                        this.mediaMode = loadData.mediaMode;
                        this.videoMode = loadData.mediaMode;
                    }, SET_TIMEOUT.EXTREMELY);

                    this.url = loadData.originalContentUrl;
                    this.acceptFileType = this.videoAcceptFileType;
                    if (loadData.mediaMode === "url") this.videoUrl = loadData.originalContentUrl;
                    else {
                        if (loadData.originalContentUrl) {
                            this.uploadFrameBg = this.videoUploadFrameBg = loadData.originalContentUrl;
                            this.videoFileListObj = this.fileListObj = fileObj;
                        }
                    }
                }

                break;
        }

        // resolve from ngAfterViewChecked issue
        setTimeout(() => {
            this.changeDetectorRef.reattach();
        }, SET_TIMEOUT.REATTACH);
    }

    parseValueContentFromloadData(): void {
        const cardContent = Object.assign({});
        const btnValueContent = [];
        this.replyBtnAry.forEach((item, index) => {
            btnValueContent[index] = item.valueContent;
            cardContent[this.id] = btnValueContent;
        });

        const key = Object.keys(cardContent)[0];
        const value = Object.values(cardContent)[0];
        const cardLabelDataObj = this.qaEditorService.cardLabelData;
        if (!cardLabelDataObj[this.data.channel]) cardLabelDataObj[this.data.channel] = {};
        cardLabelDataObj[this.data.channel][key] = value;
    }

    /**
     * setResultState
     *
     * @memberof CardContentComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        const filesObj = !!Object.keys(this.fileListObj).length ? this.fileListObj : {};
        const fObject = !!filesObj[0] ? filesObj[0] : {};
        const channel = this.data.channel;
        const objIdx =
            this.data.id + "_" + (this.data.type === "MediaCard" ? this.data.currentCard : this.data.theoryCardId);

        const result = this.cardContentObj.result || {};
        result[channel] = result[channel] || {};

        let FQACardAnswer = [];
        FQACardAnswer = this.parseData("changeToServerData", this.replyBtnAry);

        const cardLabelData = this.qaEditorService.cardLabelData || {};

        this.id = (this.id || "").replace("_undefined", "");
        if (!!cardLabelData[channel] && cardLabelData[channel][this.id]) {
            if (!!Object.keys(cardLabelData[channel][this.id]).length) {
                cardLabelData[channel][this.id].forEach((item, index) => {
                    if (!FQACardAnswer[index]) {
                        const ValueContent = {
                            ValueContent: "",
                        };
                        ValueContent.ValueContent = item;
                        FQACardAnswer[index] = ValueContent;
                        this.replyBtnAry[index].valueContent = item;
                    } else if (FQACardAnswer[index].Option === "QA") {
                        if (!!FQACardAnswer[index]?.FCode && FQACardAnswer[index].FCode.length > 0) {
                            try {
                                const parseCode = JSON.parse(FQACardAnswer[index].FCode);
                                if (item.length === 0) delete parseCode.label;
                                else if (!Object.keys(item).length) delete parseCode.label;
                                else parseCode.label = item;
                                FQACardAnswer[index].FCode = JSON.stringify(parseCode);
                            } catch (e) {}
                        }
                        if (!!FQACardAnswer[index]) FQACardAnswer[index].ValueContent = item;
                        this.replyBtnAry[index].valueContent = item;
                        this.changeDetectorRef.detectChanges();
                    } else if (!!FQACardAnswer[index]) FQACardAnswer[index].ValueContent = "";
                });
            }
        }

        let resultObj: IAnsCardContentJson;
        switch (this.data.type) {
            case "MediaCard":
                const mediaMode = this.mediaMode || "";
                const mediaType = this.mediaType.toLowerCase() || "";

                resultObj = {
                    type: "MediaCard",
                    channel,
                    version: "v770",
                    name: !!this.fileListObj[0] ? this.fileListObj[0].name || "" : "MediaCard",
                    size: !!this.fileListObj[0] ? this.fileListObj[0].size : 0,
                    mediaMode,
                    mediaType,
                    originalContentUrl:
                        this.mediaType === "image" && mediaMode === "upload" ? this.uploadFrameBg : this.url,
                    fbId: this.fbId,
                    FQACardAnswer,
                    gWUploadFormData: !!fObject.formData ? fObject.formData : "",
                };
                break;
            case "Cards":
                let imageClickUrl = "";
                let title = "";
                let FMsgAnswer = "";
                let text = "";
                let textHint = "";
                if (!!this.imageClickUrl)
                    imageClickUrl = (this.imageClickUrl.nativeElement as HTMLInputElement).value || "";
                if (!!this.title) title = (this.title.nativeElement as HTMLInputElement).value || "";
                if (!!this.FMsgAnswer) FMsgAnswer = (this.FMsgAnswer.nativeElement as HTMLInputElement).value || "";
                if (!!this.text) text = (this.text.nativeElement as HTMLInputElement).value;
                if (!!this.textHint) textHint = (this.textHint.nativeElement as HTMLInputElement).value;

                this.cardContentService.setCardPicState({
                    groupId: this.data.id,
                    index: this.data.theoryCardId,
                    hasPic: this.url === "" ? false : true,
                });

                resultObj = {
                    type: "Cards",
                    channel,
                    id: this.id,
                    thumbnailImageUrl: this.uploadFrameBg,
                    imageClickUrl,
                    title,
                    textToSpeech: text,
                    imgHint: textHint,
                    FMsgAnswer,
                    FQACardAnswer,
                    gWUploadFormData: !!fObject.formData ? fObject.formData : "",
                };
                break;
        }

        result[channel] = Object.assign(result[channel], { [objIdx]: resultObj }, {});

        this.lastResultObj = resultObj;
        this.cardContentService.setState({
            data: { result },
        });
    }

    /**
     * handleMediaTypeChange
     *
     * @param {*} event
     * @memberof CardContentComponent
     */
    handleMediaTypeChange(event) {
        this.verifyState.mediaCardUrl = this.initVerifyState;
        this.verifyState.mediaCardUpload = this.initVerifyState;
        this.verifyState.replyCount = this.initVerifyState;
        if (this.mediaType !== event) {
            this.mediaType = event;
            this.verifyState["url"] = this.initVerifyState;
            this.verifyState["upload"] = this.initVerifyState;
            switch (event) {
                case "image":
                    this.mediaMode = this.imageMode;
                    this.url = this.imageUrl;
                    this.uploadFrameBg = this.imgUploadFrameBg;
                    this.acceptFileType = this.imageAcceptFileType;
                    this.fileListObj = this.imgFileListObj;
                    break;
                case "video":
                    this.mediaMode = this.videoMode;
                    this.url = this.videoUrl;
                    this.uploadFrameBg = this.videoUploadFrameBg;
                    this.acceptFileType = this.videoAcceptFileType;
                    this.fileListObj = this.videoFileListObj;
                    break;
            }
        }
    }

    /**
     * handleModeChange
     *
     * @param {*} event
     * @memberof CardContentComponent
     */
    handleModeChange(event) {
        this.verifyState.mediaCardUrl = this.initVerifyState;
        this.verifyState.mediaCardUpload = this.initVerifyState;
        this.verifyState.replyCount = this.initVerifyState;
        this.url = "";
        if (this.mediaType === "image") {
            this.mediaMode = this.imageMode = event;
            if (event === "url") {
                this.url = "";
                this.fileListObj = this.imgFileListObj = {};
            } else {
                this.imageUrl = "";
                this.fileListObj = this.imgFileListObj;
            }
        } else {
            this.mediaMode = this.videoMode = event;
            if (event === "url") {
                this.url = "";
                this.fileListObj = this.videoFileListObj = {};
            } else {
                this.videoUrl = "";
                this.fileListObj = this.videoFileListObj;
            }
        }
    }

    /**
     * handleMediaCardUrl
     *
     * @param {*} event
     * @memberof CardContentComponent
     */
    handleMediaCardUrl(event) {
        this.url = event;
        if (this.mediaType === "image") this.imageUrl = event;
        else this.videoUrl = event;
    }

    /**
     * ### 卡片內容移動
     *
     * @param {number} cardIdx
     * @param {string} cardId
     * @param {string} action
     * @return {*}
     * @memberof CardContentComponent
     */
    moveCardContent(cardIdx: number, cardId: string, action: string) {
        if (cardId !== this.id) return;

        const currentCardId = cardId.split("_")[0];
        const currentCardIdx = +cardId.split("_")[1];
        const viewContainerRef = this.data.viewContainerRef;
        const viewRef = viewContainerRef.get(cardIdx);
        const swapIdx = action === "right" ? cardIdx + 1 : cardIdx - 1;
        viewContainerRef.move(viewRef, swapIdx);

        setTimeout(() => {
            this.id = currentCardId + "_" + currentCardIdx;
            this.changeDetectorRef.detectChanges();
        }, SET_TIMEOUT.REATTACH);
    }

    ngOnInit(): void {
        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.id = this.data.id + "_" + this.data.theoryCardId;

        this.subIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp === true) this.verifyForm();
        });

        this.subIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
            if (resp && this.lastResultObj && !this.isOninit) this.verifyForm();
        });

        this.subCardPicState = this.cardContentService.cardPicState$.subscribe((resp) => {
            // if (resp && this.lastResultObj) this.verifyForm();
            this.cardPicState = resp;
        });

        this.globalService$ = this.globalService.globalRxjs$.subscribe((resp) => {
            this.globalData = resp;
        });

        this.subReplyQAData = this.smartQaEditorService.replyQAData$.subscribe((resp) => {
            if (resp.length > 0) this.setQACode(resp[0], resp[1]);
        });

        this.subGreetingReplyQAData = this.greetingEditorService.replyQAData$.subscribe((resp) => {
            if (resp.length > 0) this.setQACode(resp[0], resp[1]);
        });

        // preview aspect ratio image
        this.ImageAspectRatio = this.qaCardService.qaCardImageAspectRatio$.subscribe((resp) => {
            if (!!resp[this.data.id]) this.imgRatio = resp[this.data.id];
        });

        this.CardContentState = this.cardContentService.cardContentState$.subscribe((resp) => {
            this.cardContentObj = resp.data || {};
        });

        this.CardContentMove = this.cardContentService.cardContentMove$.subscribe((resp) => {
            if (!!resp?.action) this.moveCardContent(resp.cardIdx, resp.cardId, resp.action);
        });

        if (this.data.loadData) {
            // image aspect ratio of card
            this.imgRatio = this.data.loadData.imageAspectRatio;
            this.isLoad = true;
            if (!!~this.data.channel.indexOf("google"))
                this.data.loadData.FQACardAnswer = this.data.loadData.FQACardAnswer.slice(0, 1);
        }
        this.isOninit = false;

        this.REPLY_QTY_MIN = !!~this.data.channel.indexOf("google") ? REPLY_QTY.GOOGLE_MIN : REPLY_QTY.MIN;
        this.REPLY_QTY_MAX = !!~this.data.channel.indexOf("google") ? REPLY_QTY.GOOGLE_MAX : REPLY_QTY.MAX;

        this.cardSubtitle =
            this.i18n.QA_EDITOR.PLACEHOLDER[
                !!~this.data.channel.indexOf("google") ? "GOOGLE_CARD_SUBTITLE" : "CARD_SUBTITLE"
            ];

        const channel = this.data.channel.split("_")[0];
        this.isReplyQaDisplayText = !~["messenger", "google", "instagram"].indexOf(channel);
    }

    ngAfterViewInit() {
        if (
            localStorage.getItem("defaultImageEnable") &&
            localStorage.getItem("defaultImageEnable") === "true" &&
            this.data.type === "Cards"
        ) {
            this.url = this.uploadFrameBg = localStorage.getItem("defaultImage") || "";
            this.fileListObj = {
                0: {
                    size: 1,
                    formData: "",
                },
            };
            this.changeDetectorRef.detectChanges();
        }

        this.isLine = !!~this.data.channel.indexOf("line");
        this.isGoogle = !!~this.data.channel.indexOf("google");
    }

    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
            this.parseValueContentFromloadData();
        } else this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.globalService$) this.globalService$.unsubscribe();
        if (!!this.ImageAspectRatio) this.ImageAspectRatio.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
        if (!!this.CardContentState) this.CardContentState.unsubscribe();
        if (!!this.CardContentMove) this.CardContentMove.unsubscribe();
        if (!!this.subGreetingReplyQAData) this.subGreetingReplyQAData.unsubscribe();

        this.cardContentService.setCardPicState(
            {
                groupId: this.data.id,
                index: this.data.theoryCardId,
            },
            true
        );
    }

    // REPLY-BTN----------------------------

    /**
     * setQACode
     *
     * @param {*} value
     * @param {*} id
     * @memberof CardContentComponent
     */
    setQACode(value, id) {
        // send Old CBE callback data here to append to UI.
        const data = Object.assign({}, value);
        this.replyBtnAry.forEach((item) => {
            if (item.id === id) {
                data.type = "QA";
                item.qaFCode = JSON.stringify(data);
                if (!!~this.data.channel.indexOf("google")) item.FShowText = value.name;
                item.qaFName = value.name;
                item.qaFDisplayText = value.name;
            }
        });
        if (this.data.module === "qa-editor") this.smartQaEditorService.clearReplyQAData();
        else this.greetingEditorService.clearReplyQAData();
    }

    /**
     * openSmartQAList
     *
     * @param {*} item
     * @memberof CardContentComponent
     */
    openSmartQAList(item) {
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
     * createReplyContent
     *
     * @memberof CardContentComponent
     */
    createReplyContent() {
        if (this.replyBtnAry.length < this.REPLY_QTY_MAX) {
            this.replyBtnAry.push({
                FShowText: "",
                Option: "QA",
                qaFDisplayText: "",
                qaFCode: "",
                qaFName: "",
                optionFDisplayText: "",
                optionFCode: "",
                optionFName: "",
                urlFName: "",
                verify: {
                    FShowText: this.initVerifyState,
                    qaFDisplayText: this.initVerifyState,
                    qaFCode: this.initVerifyState,
                    optionFDisplayText: this.initVerifyState,
                    optionFCode: this.initVerifyState,
                    urlFName: this.initVerifyState,
                },
                isShow: true,
                hasEmptyReplyIpt: false,
                valueContent: "",
                id: Math.random().toString(36).substring(7),
            });
        }
        console.log(this.data);
        console.log(this.replyBtnAry);
    }

    /**
     * inputChange
     *
     * @param {*} value
     * @param {*} item
     * @param {*} type
     * @memberof CardContentComponent
     */
    inputChange(value, item, type) {
        const index = this.replyBtnAry.indexOf(item);
        switch (type) {
            case "displayText":
                switch (item.Option) {
                    case "QA":
                        this.replyBtnAry[index].qaFDisplayText = value;
                        break;
                    case "Option":
                        this.replyBtnAry[index].optionFDisplayText = value;
                        break;
                }
                break;
            case "showText":
                this.replyBtnAry[index].FShowText = value;
                break;
            case "code":
                switch (item.Option) {
                    case "QA":
                        this.replyBtnAry[index].qaFCode = value;
                        break;
                    case "Option":
                        this.replyBtnAry[index].optionFCode = value;
                        break;
                }
                break;
            case "name":
                this.replyBtnAry[index].urlFName = value;
                break;
        }
    }

    /**
     * openButton
     *
     * @param {*} item
     * @memberof CardContentComponent
     */
    openButton(item) {
        const index = this.replyBtnAry.indexOf(item);
        this.replyBtnAry[index].isShow = true;
        this.replyBtnAry[index].hasEmptyReplyIpt = false;
    }

    /**
     * closeButton
     *
     * @param {*} itemId
     * @param {*} fromHTML
     * @memberof CardContentComponent
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
                ((item.Option === "QA" &&
                    item.qaFDisplayText.trim().length !== 0 &&
                    item.qaFCode.trim().length !== 0) ||
                    (item.Option === "Option" &&
                        item.optionFCode.trim().length !== 0 &&
                        item.optionFDisplayText.trim().length !== 0) ||
                    (item.Option === "Url" && item.urlFName.trim().length !== 0)) &&
                item.FShowText.trim().length !== 0
            ) {
                this.replyBtnAry[index].hasEmptyReplyIpt = false;
                this.replyBtnAry[index].isShow = false;
            } else if (
                (item.Option === "QA" &&
                    (item.qaFDisplayText.trim().length !== 0 || item.qaFCode.trim().length !== 0)) ||
                (item.Option === "Option" &&
                    (item.optionFCode.trim().length !== 0 || item.optionFDisplayText.trim().length !== 0)) ||
                (item.Option === "Url" && item.urlFName.trim().length !== 0) ||
                item.FShowText.trim().length !== 0
            ) {
                // Some inputs are had value.
                if (fromHTML && !this.isVerify) this.replyBtnAry[index].hasEmptyReplyIpt = false;
                else this.replyBtnAry[index].hasEmptyReplyIpt = true;
                this.replyBtnAry[index].isShow = false;
            } else if (!!this.replyBtnAry[index].valueContent && this.replyBtnAry[index].valueContent.length > 0) {
                this.replyBtnAry[index].hasEmptyReplyIpt = true;
                this.replyBtnAry[index].isShow = false;
            } else this.removeButton(itemId, fromHTML);
        }
    }

    /**
     * removeButton
     *
     * @param {*} itemId
     * @param {*} [fromHTML]
     * @memberof CardContentComponent
     */
    removeButton(itemId, fromHTML?) {
        let index = 0;

        this.replyBtnAry.forEach((btnItem, idx) => {
            if (itemId === btnItem.id) {
                index = idx;
            }
        });

        this.replyBtnAry.splice(index, 1);
        const cardLabelData = this.qaEditorService.cardLabelData[this.data.channel];
        if (!!cardLabelData) cardLabelData[this.id].splice(index, 1);
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
        const id = this.data.id;
        const currentCard = this.data.currentCard;
        const pIdx = $event.previousIndex;
        const cIdx = $event.currentIndex;

        let cardLabelDataList = [];
        if (this.data.type === "MediaCard")
            cardLabelDataList = this.qaEditorService.cardLabelData?.[channel]?.[id] || [];
        else cardLabelDataList = this.qaEditorService.cardLabelData?.[channel]?.[id + "_" + currentCard] || [];
        for (const i in this.replyBtnAry) cardLabelDataList[i] = cardLabelDataList[i] || {};

        const elem = cardLabelDataList.splice(pIdx, 1);
        cardLabelDataList.splice(cIdx, 0, elem[0]);

        moveItemInArray(this.replyBtnAry, pIdx, cIdx);
        this.changeDetectorRef.detectChanges();
    }

    /**
     * changeOption
     *
     * @param {*} value
     * @param {*} item
     * @memberof CardContentComponent
     */
    changeOption(value, item) {
        const index = this.replyBtnAry.indexOf(item);
        switch (value) {
            case "Q-A":
                this.replyBtnAry[index].Option = "QA";
                break;
            case "指令":
                this.replyBtnAry[index].Option = "Option";
                break;
            case "URL":
                this.replyBtnAry[index].Option = "Url";
        }
    }

    /**
     * onOpenUpload
     *
     * @param {string} [mode='']
     * @memberof CardContentComponent
     */
    onOpenUpload(mode = "") {
        this.utilitiesService.openUpload(this.file);
    }
}
