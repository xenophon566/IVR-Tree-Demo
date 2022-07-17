import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { QaEditorService, QaImageService } from "@core/state";
import { GlobalService, SET_TIMEOUT, VerifyService } from "@core/services";
import { IAnsImageJson } from "@core/state/qa-editor/answer-json.interface";
import { CropperDialogComponent } from "@shared/components/dialog/cropper-dialog/cropper-dialog.component";
import { EditorService } from "@core/services/editor.service";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";

/**
 * QaImageComponent
 *
 * @export
 * @class QaImageComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-image",
    templateUrl: "./qa-image.component.html",
    styleUrls: ["./qa-image.component.scss"],
})
export class QaImageComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private nbDialogService: NbDialogService,
        private qaImageService: QaImageService,
        private changeDetectorRef: ChangeDetectorRef,
        private globalService: GlobalService,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private postMessageService: PostMessageService,
        private utilitiesService: UtilitiesService,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");

        this.previewImgFormat = [];
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    @ViewChild("uploadFile") uploadFile: ElementRef<HTMLElement>;
    @ViewChild("file") file: ElementRef<HTMLElement>;
    @ViewChild("linkImageFile") linkImageFile: ElementRef<HTMLElement>;
    @ViewChild("textImageFile") textImageFile: ElementRef<HTMLElement>;
    @ViewChild("previewFile") previewFile: ElementRef<HTMLElement>;
    @ViewChild("previewImgUpload") previewImgUpload: ElementRef<HTMLElement>;
    @ViewChild("imageUrl") imageUrl: ElementRef<HTMLElement>;
    @ViewChild("linkImageUrl") linkImageUrl: ElementRef<HTMLElement>;
    @ViewChild("textImageUrl") textImageUrl: ElementRef<HTMLElement>;
    @ViewChild("previewImageUrl") previewImageUrl: ElementRef<HTMLElement>;
    @ViewChild("linkUrl") linkUrl: ElementRef<HTMLElement>;
    @ViewChild("clickText") clickText: ElementRef<HTMLElement>;

    @Input() data: any;

    QA_EDITOR: any = {};

    componentId: string;

    channelId: string = "";

    isLoad = false;

    isOninit: boolean = false;

    isPreviewImageUpload = false;

    selectedMode: string = "url";

    imageSelectedMode: string = "url";

    linkImageSelectedMode: string = "url";

    textImageSelectedMode: string = "url";

    previewSelectedMode: string = "url";

    globalService$: any;

    globalData: any;

    QaImageState: any;

    qaImageObj: any = {};

    fileListObj: any = {};

    linkImgFileListObj: any = {};

    textImgFileListObj: any = {};

    imgFileListObj: any = {};

    previewFileListObj: any = {};

    sysThumbnailUrl: any = "";

    imageFrameBg = "";

    linkImageFrameBg = "";

    textImageFrameBg = "";

    previewUploadFrameBg = "";

    previewImgFormat = [];

    imageType: string = "Image";

    acceptFileType: string = ".jpg,.jpeg,.png";

    hideLinkImageArr = ["messenger", "messenger_Activity", "instagram", "instagram_Activity"];

    subIsSave: any;

    subIsNeedVerify: any;

    initVerifyState: any = {
        state: true,
        errMsg: "",
    };

    imgURL: any;

    thunmbnailImgURL: any;

    lastResultObj: IAnsImageJson;

    /**
     * verify State
     *
     * @type {*}
     * @memberof QaImageComponent
     */
    verifyState: any = {
        imageUrl: this.initVerifyState,
        linkImageUrl: this.initVerifyState,
        textImageUrl: this.initVerifyState,
        previewImageUrl: this.initVerifyState,
        linkUrl: this.initVerifyState,
        imageUpload: this.initVerifyState,
        linkImageUpload: this.initVerifyState,
        textImageUpload: this.initVerifyState,
        previewImageUpload: this.initVerifyState,
        clickText: this.initVerifyState,
    };

    i18nUploadMaxSize = "0";

    verifyObj = {
        url: ["hasHTTPS", "maxLength,1000", "isRequired"],
        upload: ["maxSize,10", "isRequired"],
        linkImageUpload: ["maxSize,1", "isRequired"],
        textImageUpload: ["maxSize,1", "isRequired"],
        thumbnailUpload: ["maxSize,1", "isRequired"],
        clickText: ["maxLength,20", "isRequired"],
    };

    /**
     * set Init Verify State
     *
     * @memberof QaImageComponent
     */
    setInitVerifyState() {
        this.verifyState = {
            imageUrl: this.initVerifyState,
            linkImageUrl: this.initVerifyState,
            textImageUrl: this.initVerifyState,
            previewImageUrl: this.initVerifyState,
            linkUrl: this.initVerifyState,
            imageUpload: this.initVerifyState,
            linkImageUpload: this.initVerifyState,
            textImageUpload: this.initVerifyState,
            previewImageUpload: this.initVerifyState,
            clickText: this.initVerifyState,
        };
    }

    getSizeLimit(mode, key) {
        let result;
        if (this.verifyObj[mode] && this.verifyObj[mode].length > 0) {
            this.verifyObj[mode].forEach((item) => {
                if (!!~item.indexOf(key)) {
                    result = Number(item.split(",")[1]);
                    if (mode === "upload") result = !!~this.data.channel.indexOf("instagram") ? 8 : result;
                }
            });
        }

        return result;
    }

    /**
     * image Upload Event
     *
     * @param {*} $event
     * @param {string} [mode='']
     * @memberof QaImageComponent
     */
    imageUploadEvent($event: any, mode = ""): void {
        if (!!$event.target.value) {
            const filePath = $event.target.value;
            const filePathArr = filePath.split(".");
            const imageFormat = filePathArr[filePathArr.length - 1];
            const fileInfo = $event.target.files[0];
            if (!!~this.acceptFileType.indexOf(imageFormat.toLowerCase())) {
                let isCanUpload = true;
                switch (mode) {
                    case "image":
                        const imgLimitMaxSize = this.getSizeLimit("upload", "maxSize");
                        if (imgLimitMaxSize && imgLimitMaxSize < fileInfo.size / 1024 / 1024) isCanUpload = false;
                        break;
                    case "linkImage":
                        const linkImgLimitMaxSize = this.getSizeLimit("linkImageUpload", "maxSize");
                        if (linkImgLimitMaxSize && linkImgLimitMaxSize < fileInfo.size / 1024 / 1024)
                            isCanUpload = false;
                        break;
                    case "textImage":
                        const textmgLimitMaxSize = this.getSizeLimit("linkImageUpload", "maxSize");
                        if (textmgLimitMaxSize && textmgLimitMaxSize < fileInfo.size / 1024 / 1024) isCanUpload = false;
                        break;
                    case "preview":
                        const previewLimitMaxSize = this.getSizeLimit("thumbnailUpload", "maxSize");
                        if (previewLimitMaxSize && previewLimitMaxSize < fileInfo.size / 1024 / 1024)
                            isCanUpload = false;
                        break;
                }

                if (isCanUpload) {
                    this.nbDialogService
                        .open(CropperDialogComponent, {
                            context: {
                                imageFiles: fileInfo,
                                componentType: this.imageType,
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
                this.postMessageService.postMessage("showNotSupportError");
                $event.target.value = "";
                console.debug("格式不相符，請重新上傳");
            }
        }
    }

    /**
     * image Upload
     *
     * @param {*} [$event=null]
     * @param {*} [croppedImage=null]
     * @param {string} [mode='']
     * @memberof QaImageComponent
     */
    imageUpload($event = null, croppedImage = null, mode = "") {
        const files = Object.assign({}, $event.target.files);
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

        switch (mode) {
            case "image":
                this.imageFrameBg = croppedImage.blobUrl;
                this.fileListObj = this.imgFileListObj = files;
                this.file.nativeElement["value"] = "";
                break;
            case "preview":
                this.previewUploadFrameBg = croppedImage.blobUrl;
                this.previewFileListObj = files;
                this.previewFile.nativeElement["value"] = "";
                break;
            case "linkImage":
                this.linkImageFrameBg = croppedImage.blobUrl;
                this.fileListObj = this.linkImgFileListObj = files;
                this.linkImageFile.nativeElement["value"] = "";
                break;
            case "textImage":
                this.textImageFrameBg = croppedImage.blobUrl;
                this.fileListObj = this.textImgFileListObj = files;
                this.textImageFile.nativeElement["value"] = "";
                break;
        }
        this.setResultState();
    }

    /**
     * upload Remove
     *
     * @param {*} evt
     * @param {string} [uploadType='image']
     * @memberof QaImageComponent
     */
    uploadRemove(evt, uploadType = "image") {
        evt.stopPropagation();

        switch (uploadType) {
            case "image":
                this.file.nativeElement["value"] = "";
                this.imageFrameBg = "";
                this.imgFileListObj = {};
                break;
            case "preview":
                this.previewFile.nativeElement["value"] = "";
                this.previewUploadFrameBg = "";
                this.previewFileListObj = {};
                break;
            case "linkImage":
                this.file.nativeElement["value"] = "";
                this.linkImageFrameBg = "";
                this.linkImgFileListObj = {};
                break;
        }
    }

    /**
     * preview Mode Change
     *
     * @memberof QaImageComponent
     */
    previewModeChange() {
        this.verifyState["previewImageUrl"] = this.initVerifyState;
        this.verifyState["previewImageUpload"] = this.initVerifyState;
        this.previewUploadFrameBg = "";
        this.previewFileListObj = {};
    }

    /**
     * verify Form
     *
     * @memberof QaImageComponent
     */
    verifyForm() {
        this.setInitVerifyState();
        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web") && !!this.lastResultObj)
            this.isAllEmpty();

        switch (this.imageType) {
            case "Image":
                if (this.imageSelectedMode === "url") {
                    if (!!this.imageUrl) {
                        this.verifyState["imageUrl"] = this.verifyService.verify(
                            (this.imageUrl.nativeElement as HTMLInputElement).value,
                            this.verifyObj.url
                        );
                    }
                } else {
                    let fileSize = "";
                    if (Object.keys(this.imgFileListObj).length === 0) {
                        fileSize = "";
                    } else {
                        // MB
                        fileSize = (this.imgFileListObj[0].size / 1024 / 1024).toString();
                    }
                    this.verifyState["imageUpload"] = this.verifyService.verify(fileSize, this.verifyObj.upload);
                }

                switch (this.previewSelectedMode) {
                    case "url":
                        const isPreviewVerify =
                            this.data.channel !== "messenger" && this.data.channel !== "messenger_Activity";

                        if (isPreviewVerify && !!this.previewImageUrl) {
                            this.verifyState["previewImageUrl"] = this.verifyService.verify(
                                (this.previewImageUrl.nativeElement as HTMLInputElement).value,
                                this.verifyObj.url
                            );
                        }
                        break;
                    case "upload":
                        let fileSize = "";
                        if (Object.keys(this.previewFileListObj).length === 0) {
                            fileSize = "";
                        } else {
                            // MB
                            fileSize = (this.previewFileListObj[0].size / 1024 / 1024).toString();
                        }
                        this.verifyState["previewImageUpload"] = this.verifyService.verify(
                            fileSize,
                            this.verifyObj.thumbnailUpload
                        );
                        break;
                }
                break;
            case "LinkImage":
                this.verifyState["linkUrl"] = this.verifyService.verify(
                    (this.linkUrl.nativeElement as HTMLInputElement).value,
                    this.verifyObj.url
                );

                if (this.linkImageSelectedMode === "url")
                    this.verifyState["linkImageUrl"] = this.verifyService.verify(
                        (this.linkImageUrl.nativeElement as HTMLInputElement).value,
                        this.verifyObj.url
                    );
                else {
                    let fileSize = "";
                    if (Object.keys(this.linkImgFileListObj).length === 0) {
                        fileSize = "";
                    } else {
                        // MB
                        fileSize = (this.linkImgFileListObj[0].size / 1024 / 1024).toString();
                    }
                    this.verifyState["linkImageUpload"] = this.verifyService.verify(
                        fileSize,
                        this.verifyObj.linkImageUpload
                    );
                }
                break;
            case "TextImage":
                this.verifyState["clickText"] = this.verifyService.verify(
                    (this.clickText.nativeElement as HTMLInputElement).value,
                    this.verifyObj.clickText
                );

                if (this.textImageSelectedMode === "url")
                    this.verifyState["textImageUrl"] = this.verifyService.verify(
                        (this.textImageUrl.nativeElement as HTMLInputElement).value,
                        this.verifyObj.url
                    );
                else {
                    let fileSize = "";
                    if (Object.keys(this.textImgFileListObj).length === 0) {
                        fileSize = "";
                    } else {
                        // MB
                        fileSize = (this.textImgFileListObj[0].size / 1024 / 1024).toString();
                    }
                    this.verifyState["textImageUpload"] = this.verifyService.verify(
                        fileSize,
                        this.verifyObj.textImageUpload
                    );
                }
                break;
        }
        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });
        this.qaEditorService.setVerifyState({
            id: this.data.id,
            state: result,
            channel: this.data.channel,
            component: "image",
        });
    }

    /**
     * image Format Change
     *
     * @memberof QaImageComponent
     */
    ImgFormatChange() {
        switch (this.imageType) {
            case "Image":
                this.selectedMode = this.imageSelectedMode;
                this.verifyState["linkImageUrl"] = this.initVerifyState;
                this.verifyState["linkUrl"] = this.initVerifyState;
                this.verifyState["linkImageUpload"] = this.initVerifyState;
                this.verifyState["clickText"] = this.initVerifyState;
                break;
            case "LinkImage":
                this.selectedMode = this.linkImageSelectedMode;
                this.verifyState["imageUrl"] = this.initVerifyState;
                this.verifyState["previewImageUrl"] = this.initVerifyState;
                this.verifyState["imageUpload"] = this.initVerifyState;
                this.verifyState["previewImageUpload"] = this.initVerifyState;
                this.verifyState["clickText"] = this.initVerifyState;
                break;
            case "TextImage":
                this.selectedMode = this.textImageSelectedMode;
                this.verifyState["linkImageUrl"] = this.initVerifyState;
                this.verifyState["linkUrl"] = this.initVerifyState;
                this.verifyState["linkImageUpload"] = this.initVerifyState;
                this.verifyState["imageUrl"] = this.initVerifyState;
                this.verifyState["previewImageUrl"] = this.initVerifyState;
                this.verifyState["imageUpload"] = this.initVerifyState;
                this.verifyState["previewImageUpload"] = this.initVerifyState;
                break;
        }
    }

    /**
     * mode Change
     *
     * @memberof QaImageComponent
     */
    modeChange() {
        this.setInitVerifyState();

        switch (this.imageType) {
            case "Image":
                this.imageSelectedMode = this.selectedMode;
                this.verifyState["imageUrl"] = this.initVerifyState;
                this.verifyState["imageUpload"] = this.initVerifyState;
                this.sysThumbnailUrl = "";
                if (this.selectedMode === "upload") {
                    if (this.previewImgFormat.length === 2) {
                        this.previewImgFormat.push({
                            value: "system",
                            name: this.QA_EDITOR.IMAGE.THUMBNAIL_SYSTEM,
                        });
                    }
                    this.fileListObj = this.imgFileListObj;
                    if (!!this.imageUrl) (this.imageUrl.nativeElement as HTMLInputElement).value = "";
                    if (!!this.previewImageUrl) (this.previewImageUrl.nativeElement as HTMLInputElement).value = "";

                    this.changeDetectorRef.detectChanges();
                    this.previewSelectedMode = "system";
                } else {
                    if (this.previewImgFormat.length === 3) this.previewImgFormat.pop();
                    this.fileListObj = this.imgFileListObj = {};

                    if (this.imageFrameBg.indexOf("blob") !== -1 && this.imgURL)
                        this.imgURL.revokeObjectURL(this.imageFrameBg);
                    this.imageFrameBg = "";
                    this.previewSelectedMode = "url";
                    if (!!this.imageUrl) (this.imageUrl.nativeElement as HTMLInputElement).value = "";
                    if (!!this.previewImageUrl) (this.previewImageUrl.nativeElement as HTMLInputElement).value = "";
                }
                break;
            case "LinkImage":
                this.linkImageSelectedMode = this.selectedMode;
                this.verifyState["linkImageUrl"] = this.initVerifyState;
                this.verifyState["linkImageUpload"] = this.initVerifyState;

                if (this.selectedMode === "upload") {
                    this.fileListObj = this.linkImgFileListObj;
                    (this.linkImageUrl.nativeElement as HTMLInputElement).value = "";
                } else {
                    this.fileListObj = this.linkImgFileListObj = {};
                    if (this.linkImageFrameBg.indexOf("blob") !== -1 && this.imgURL)
                        this.imgURL.revokeObjectURL(this.linkImageFrameBg);
                    this.linkImageFrameBg = "";
                }
                break;
            case "TextImage":
                this.textImageSelectedMode = this.selectedMode;
                this.verifyState["textImageUrl"] = this.initVerifyState;
                this.verifyState["textImageUpload"] = this.initVerifyState;

                if (this.selectedMode === "upload") {
                    this.fileListObj = this.textImgFileListObj;
                    (this.textImageUrl.nativeElement as HTMLInputElement).value = "";
                } else {
                    this.fileListObj = this.linkImgFileListObj = {};
                    if (this.textImageFrameBg.indexOf("blob") !== -1 && this.imgURL)
                        this.imgURL.revokeObjectURL(this.textImageFrameBg);
                    this.textImageFrameBg = "";
                }
                break;
        }
    }

    /**
     * append To Component
     *
     * @memberof QaImageComponent
     */
    appendToComponent() {
        this.changeDetectorRef.detach();
        const loadData = this.data.loadData;
        this.imageType = loadData.type;
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        switch (this.imageType) {
            case "Image":
                this.imageSelectedMode = this.selectedMode = loadData.imageMode;

                if (!!this.imageUrl && loadData.imageMode === "url") {
                    (this.imageUrl.nativeElement as HTMLInputElement).value = loadData.imageUrl;
                    this.previewImgFormat.pop();
                } else {
                    if (loadData.size && loadData.size !== "" && !Number(loadData.size))
                        loadData.size = this.parseStringSize(loadData.size);

                    if (loadData.imageUrl) {
                        this.imageFrameBg = loadData.imageUrl;
                        this.imgFileListObj = this.fileListObj = {
                            0: {
                                name: loadData.name || "",
                                width: loadData.width,
                                height: loadData.height,
                                size: loadData.size || 0,
                                src: loadData.imageUrl,
                                formData: loadData.gWUploadFormData || "",
                            },
                        };
                    }
                }

                this.previewSelectedMode = loadData.thumbnailMode;

                const isPreviewVerify = this.data.channel !== "messenger" && this.data.channel !== "messenger_Activity";

                this.sysThumbnailUrl = loadData.sysThumbnailUrl || "";
                switch (loadData.thumbnailMode) {
                    case "url":
                        if (isPreviewVerify && !!this.previewImageUrl) {
                            (this.previewImageUrl.nativeElement as HTMLInputElement).value = loadData.thumbnailUrl;
                        }
                        break;
                    case "upload":
                        if (isPreviewVerify && !!this.previewImageUrl) {
                            (this.previewImageUrl.nativeElement as HTMLInputElement).value = loadData.thumbnailUrl;
                        }
                        if (loadData.thumbnailUrl) {
                            this.previewFileListObj = {
                                0: {
                                    width: loadData.width,
                                    height: loadData.height,
                                    size: 1,
                                    src: loadData.thumbnailUrl,
                                    formData: loadData.gWUploadThumbnailFormData || "",
                                },
                            };
                            this.previewUploadFrameBg = loadData.thumbnailUrl;
                        }
                        break;
                }
                break;
            case "LinkImage":
                if (!!this.linkUrl) (this.linkUrl.nativeElement as HTMLInputElement).value = loadData.imageClickUrl;
                this.linkImageSelectedMode = this.selectedMode = loadData.imageMode;

                if (!!this.linkImageUrl && loadData.imageMode === "url") {
                    (this.linkImageUrl.nativeElement as HTMLInputElement).value = loadData.imageUrl;
                } else {
                    if (loadData.imageUrl) {
                        this.linkImgFileListObj = this.fileListObj = {
                            0: {
                                name: loadData.name,
                                size: loadData.size,
                                height: loadData.height,
                                width: loadData.width,
                                src: loadData.imageUrl,
                                formData: loadData.gWUploadFormData || "",
                            },
                        };
                        this.linkImageFrameBg = loadData.imageUrl;
                    }
                }
                if (this.previewImgFormat.length === 3) this.previewImgFormat.pop();
                break;
            case "TextImage":
                if (!!this.clickText)
                    (this.clickText.nativeElement as HTMLInputElement).value = loadData.imageClickText;
                this.textImageSelectedMode = this.selectedMode = loadData.imageMode;

                if (!!this.textImageUrl && loadData.imageMode === "url") {
                    (this.textImageUrl.nativeElement as HTMLInputElement).value = loadData.imageUrl;
                } else {
                    if (loadData.imageUrl) {
                        this.textImgFileListObj = this.fileListObj = {
                            0: {
                                name: loadData.name,
                                size: loadData.size,
                                height: loadData.height,
                                width: loadData.width,
                                src: loadData.imageUrl,
                                formData: loadData.gWUploadFormData || "",
                            },
                        };
                        this.textImageFrameBg = loadData.imageUrl;
                    }
                }
                if (this.previewImgFormat.length === 3) this.previewImgFormat.pop();
                break;
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

        // resolve from ngAfterViewChecked issue
        setTimeout(() => {
            this.changeDetectorRef.reattach();
        }, SET_TIMEOUT.REATTACH);

        this.setResultState();
    }

    /**
     * parse String Size
     *
     * @param {string} value
     * @returns
     * @memberof QaImageComponent
     */
    parseStringSize(value: string) {
        let result = 0;
        if (value.indexOf("KB") !== -1) result = Number(value.split(" ")[0]) * 1024;
        if (value.indexOf("MB") !== -1) result = Number(value.split(" ")[0]) * 1024 * 1024;
        if (value.indexOf("GB") !== -1) result = Number(value.split(" ")[0]) * 1024 * 1024 * 1024;
        return result;
    }

    /**
     * on Open Upload
     *
     * @param {string} [mode='']
     * @memberof QaImageComponent
     */
    onOpenUpload(mode = "") {
        switch (mode) {
            case "linkImage":
                this.utilitiesService.openUpload(this.linkImageFile);
                break;
            case "textImage":
                this.utilitiesService.openUpload(this.textImageFile);
                break;
            case "preview":
                this.utilitiesService.openUpload(this.previewFile);
                break;
            default:
                this.utilitiesService.openUpload(this.file);
                break;
        }
    }

    /**
     * is All Empty
     *
     * @private
     * @memberof QaImageComponent
     */
    private isAllEmpty() {
        const isAllEmptyFlag =
            !this.lastResultObj.imageUrl &&
            !this.lastResultObj.imageClickUrl &&
            !this.lastResultObj.thumbnailUrl &&
            !this.lastResultObj.gWUploadFormData &&
            !this.lastResultObj.gWUploadThumbnailFormData &&
            !this.lastResultObj.gWUploadSysFormData &&
            !this.lastResultObj.imageClickText;

        if (isAllEmptyFlag)
            this.qaEditorService.setIsRequiredVerifyState({
                image_isRequired: false,
                channel: this.data.channel,
            });
        else
            this.qaEditorService.setIsRequiredVerifyState({
                image_isRequired: true,
                channel: this.data.channel,
            });

        if (this.data.channel === "web") {
            for (const key in this.verifyObj) {
                if (isAllEmptyFlag && !this.qaEditorService.isRequiredVerify) {
                    if (!!~this.verifyObj[key].indexOf("isRequired")) this.verifyObj[key].pop();
                } else {
                    if (!~this.verifyObj[key].indexOf("isRequired")) this.verifyObj[key].push("isRequired");
                }
            }
        }
    }

    /**
     * set Result State
     *
     * @memberof QaImageComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let imageUrl = "";
        let imageClickUrl = "";
        let imageClickText = "";
        if (this.imageType === "LinkImage") this.fileListObj = this.linkImgFileListObj;
        else if (this.imageType === "TextImage") this.fileListObj = this.textImgFileListObj;
        else this.fileListObj = this.imgFileListObj;

        const filesObj = !!Object.keys(this.fileListObj).length ? this.fileListObj : {};
        const fObject = !!filesObj[0] ? filesObj[0] : {};
        let result = {};
        const channel = this.data.channel;

        if (this.imageType === "LinkImage")
            imageClickUrl = (this.linkUrl.nativeElement as HTMLInputElement).value || "";
        if (this.imageType === "TextImage")
            imageClickText = (this.clickText.nativeElement as HTMLInputElement).value || "";

        switch (this.selectedMode) {
            case "url":
                switch (this.imageType) {
                    case "LinkImage":
                        imageUrl = (this.linkImageUrl.nativeElement as HTMLInputElement).value || "";
                        break;
                    case "TextImage":
                        imageUrl = (this.textImageUrl.nativeElement as HTMLInputElement).value || "";
                        break;
                    default:
                        if (!!this.imageUrl) imageUrl = (this.imageUrl.nativeElement as HTMLInputElement).value || "";
                        break;
                }
                break;
            case "upload":
                switch (this.imageType) {
                    case "LinkImage":
                        imageUrl = this.linkImageFrameBg;
                        break;
                    case "TextImage":
                        imageUrl = this.textImageFrameBg;
                        break;
                    default:
                        imageUrl = this.imageFrameBg;
                        break;
                }
                break;
            case "system":
                imageUrl = fObject.src || "";
                break;
        }

        const previewObj = this.previewFileListObj[0] || {};
        const resultObj: IAnsImageJson = {
            channelId: this.channelId,
            channel,
            type: this.imageType,
            imageMode: this.selectedMode,
            imageClickUrl,
            imageClickText,
            imageUrl: imageUrl || "",
            thumbnailMode: this.imageType === "Image" ? this.previewSelectedMode : "",
            thumbnailUrl:
                this.previewSelectedMode === "system"
                    ? this.sysThumbnailUrl
                    : !!this.previewImageUrl
                    ? (this.previewImageUrl.nativeElement as HTMLInputElement).value
                    : previewObj.src || "",
            thumbnailSize: previewObj.size || 0,
            sysThumbnailUrl: this.sysThumbnailUrl || "",
            name: fObject.name || "image",
            width: this.selectedMode !== "url" ? fObject.width || 0 : 0,
            height: this.selectedMode !== "url" ? fObject.height || 0 : 0,
            size: this.selectedMode !== "url" ? fObject.size || 0 : 0,
            gWUploadFormData: this.selectedMode !== "url" ? fObject.formData || "" : "",
            gWUploadThumbnailFormData: this.previewSelectedMode === "upload" ? previewObj.formData || "" : "",
            gWUploadSysFormData: this.selectedMode !== "system" ? "" : "",
            version: "v770",
        };

        this.lastResultObj = resultObj;
        result = Object.assign(this.qaImageObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaImageService.setState({
                data: { result },
            });
        }
    }

    ngOnInit(): void {
        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;

        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.globalService$ = this.globalService.globalRxjs$.subscribe((resp) => {
            this.globalData = resp;
        });

        this.QaImageState = this.qaImageService.qaImageState$.subscribe((resp) => {
            this.qaImageObj = resp.data;
        });

        this.subIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.verifyForm();
        });

        this.subIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
            if (resp && !this.isOninit) this.verifyForm();
        });

        // Processing data from load api
        if (!!this.data.loadData) {
            this.isLoad = true;
        } else if (this.previewImgFormat.length === 3) this.previewImgFormat.pop();

        this.setResultState();
        this.isOninit = false;

        this.i18nUploadMaxSize = !!~this.data.channel.indexOf("instagram") ? "8" : "10";
    }

    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.QaImageState) this.QaImageState.unsubscribe();
        if (!!this.globalService$) this.globalService$.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
    }
}
