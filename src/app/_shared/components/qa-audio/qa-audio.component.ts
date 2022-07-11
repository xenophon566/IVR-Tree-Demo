import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { CropperDialogComponent } from "@shared/components/dialog/cropper-dialog/cropper-dialog.component";
import { VerifyService } from "@core/services";
import { QaAudioService, QaEditorService } from "@core/state";
import { GlobalService, SET_TIMEOUT } from "@core/services";
import { IAnsAudioJson } from "@core/state/qa-editor/answer-json.interface";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { EditorService } from "@core/services/editor.service";

/**
 * [Dynamic] qa-audio
 * component class of angular component factory
 *
 * @export
 * @class QaAudioComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-audio",
    templateUrl: "./qa-audio.component.html",
    styleUrls: ["./qa-audio.component.scss"],
})
export class QaAudioComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private nbDialogService: NbDialogService,
        private qaAudioService: QaAudioService,
        private changeDetectorRef: ChangeDetectorRef,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private globalService: GlobalService,
        private utilitiesService: UtilitiesService,
        private postMessageService: PostMessageService,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    @ViewChild("imgFile") imgFile: ElementRef<HTMLElement>;

    @ViewChild("file") file: ElementRef<HTMLElement>;

    @ViewChild("audioUrl") audioUrl: ElementRef<HTMLElement>;

    @ViewChild("imgTitle") imgTitle: ElementRef<HTMLElement>;

    @ViewChild("imgHint") imgHint: ElementRef<HTMLElement>;

    @ViewChild("previewImgUpload") previewImgUpload: ElementRef<HTMLElement>;

    @ViewChild("previewImageUrl") previewImageUrl: ElementRef<HTMLElement>;

    @ViewChild("imageUrl") imageUrl: ElementRef<HTMLElement>;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    isOninit: boolean = false;

    globalService$: any;

    globalData: any;

    selectedMode: string = "url";

    QaAudioState: any;

    qaAudioObj: any = {};

    isUploadFile = false;

    acceptFileType: string = ".mp3,.m4a";

    acceptImgFileType: string = ".jpg,.jpeg,.png";

    subIsSave: any;

    subIsNeedVerify: any;

    fileListObj: any = {};

    fileName: string = "";

    initVerifyState: any = {
        state: true,
        errMsg: "",
    };

    /**
     * verifyState
     *
     * @type {*}
     * @memberof QaAudioComponent
     */
    verifyState: any = {
        audioUrl: this.initVerifyState,
        uploadUrl: this.initVerifyState,
        imgTitle: this.initVerifyState,
        imgHint: this.initVerifyState,
        imageUpload: this.initVerifyState,
    };

    verifyObj = {
        uploadUrl: ["maxSize,10", "isRequired"],
        audioUrl: ["hasHTTPS", "maxLength,1000", "isRequired"],
        imgTitle: ["isRequired"],
        imgHint: ["isRequired"],
    };

    lastResultObj: IAnsAudioJson;

    selectedImgMode: string = "url";

    fileListImgObj: any = {};

    imageFrameBg = "";

    imgFileListObj: any = {};

    imgURL: any;

    previewImgFormat = [];

    previewSelectedMode: string = "url";

    /**
     * check is all empty for verify service
     *
     * @private
     * @memberof QaAudioComponent
     */
    private isAllEmpty() {
        const isAllEmptyFlag = !this.lastResultObj.gWUploadFormData && !this.lastResultObj.originalContentUrl;

        if (isAllEmptyFlag)
            this.qaEditorService.setIsRequiredVerifyState({
                audio_isRequired: false,
                channel: this.data.channel,
            });
        else
            this.qaEditorService.setIsRequiredVerifyState({
                audio_isRequired: true,
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
     * verification of audio component
     *
     * @memberof QaAudioComponent
     */
    verifyForm() {
        // Against web channl in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web") && !!this.lastResultObj)
            this.isAllEmpty();

        switch (this.selectedMode) {
            case "upload":
                let fileSize = "";
                if (Object.keys(this.fileListObj).length === 0) fileSize = "";
                else fileSize = (this.fileListObj[0].size / 1024 / 1024).toString(); // Unit : MB

                this.verifyState["uploadUrl"] = this.verifyService.verify(fileSize, this.verifyObj.uploadUrl);
                break;
            case "url":
                this.verifyState["audioUrl"] = this.verifyService.verify(
                    (this.audioUrl.nativeElement as HTMLInputElement).value,
                    this.verifyObj.audioUrl
                );
                break;
        }

        if (!!~this.data.channel.indexOf("google")) {
            this.verifyState["imgTitle"] = this.verifyService.verify(
                (this.imgTitle.nativeElement as HTMLInputElement).value,
                this.verifyObj.imgTitle
            );

            const imageUrl = (this.imageUrl.nativeElement as HTMLInputElement).value;
            if (!!imageUrl || !!this.imageFrameBg) {
                // console.log(imageUrl);
                // console.log(this.imageFrameBg);
            }
        }

        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });
        this.qaEditorService.setVerifyState({
            id: this.data.id,
            state: result,
            channel: this.data.channel,
            component: "audio",
        });
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

            if (!!~this.acceptImgFileType.indexOf(imageFormat.toLowerCase())) {
                let isCanUpload = true;
                switch (mode) {
                    case "image":
                        const imgLimitMaxSize = this.getSizeLimit("upload", "maxSize");
                        if (imgLimitMaxSize && imgLimitMaxSize < fileInfo.size / 1024 / 1024) isCanUpload = false;
                        break;
                }

                if (isCanUpload) {
                    this.nbDialogService
                        .open(CropperDialogComponent, {
                            context: {
                                imageFiles: fileInfo,
                                componentType: "Image",
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
        // send upload image form data
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

        console.log(files);

        switch (mode) {
            case "image":
                this.imageFrameBg = croppedImage.blobUrl;
                this.fileListImgObj = this.imgFileListObj = files;
                this.imgFile.nativeElement["value"] = "";
                break;
        }

        this.setResultState();
    }

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
     * mode switch
     *
     * @memberof QaAudioComponent
     */
    modeChange() {
        if (this.selectedMode !== "upload") {
            this.fileName = "";
            this.fileListObj = {};
        }

        this.verifyState = {
            audioUrl: this.initVerifyState,
            uploadUrl: this.initVerifyState,
            imgTitle: this.initVerifyState,
            imgHint: this.initVerifyState,
            imageUpload: this.initVerifyState,
        };
    }

    modeImgChange() {
        this.verifyState["imageUrl"] = this.initVerifyState;
        this.verifyState["imageUpload"] = this.initVerifyState;
        if (this.selectedImgMode === "upload") {
            if (this.previewImgFormat.length === 2) {
                this.previewImgFormat.push({
                    value: "system",
                    name: this.QA_EDITOR.IMAGE.THUMBNAIL_SYSTEM,
                });
            }

            this.fileListImgObj = this.imgFileListObj;
            if (!!this.imageUrl) (this.imageUrl.nativeElement as HTMLInputElement).value = "";
            if (!!this.previewImageUrl) (this.previewImageUrl.nativeElement as HTMLInputElement).value = "";

            this.previewSelectedMode = "system";
            this.changeDetectorRef.detectChanges();
        } else {
            if (this.previewImgFormat.length === 3) this.previewImgFormat.pop();
            this.fileListImgObj = {};
            this.imgFileListObj = {};

            if (this.imageFrameBg.indexOf("blob") !== -1 && this.imgURL) this.imgURL.revokeObjectURL(this.imageFrameBg);
            this.imageFrameBg = "";
            this.previewSelectedMode = "url";
            if (!!this.imageUrl) (this.imageUrl.nativeElement as HTMLInputElement).value = "";
            if (!!this.previewImageUrl) (this.previewImageUrl.nativeElement as HTMLInputElement).value = "";
        }
    }

    /**
     * upload by input file type
     *
     * @memberof QaAudioComponent
     */
    uploadFrame() {
        const el: HTMLElement = this.file.nativeElement;
        el.click();
    }

    /**
     * upload file
     *
     * @param {*} file
     * @memberof QaAudioComponent
     */
    upload(file) {
        if (!!file.length) {
            const files = Object.assign({}, file || {});
            const fileName = files[0].name;
            const splitFileName = fileName.split(".");
            const subFileName = splitFileName[splitFileName.length - 1];

            if (!!~this.acceptFileType.indexOf(subFileName.toLowerCase())) {
                if (!!~this.data.channel.indexOf("line") && subFileName !== "m4a") {
                    this.file.nativeElement["value"] = "";
                    this.postMessageService.postMessage("showNotSupportError");
                } else if (!!~this.data.channel.indexOf("google") && subFileName !== "mp3") {
                    this.file.nativeElement["value"] = "";
                    this.postMessageService.postMessage("showNotSupportError");
                } else {
                    let fileLimitSize;
                    if (this.verifyObj.uploadUrl && this.verifyObj.uploadUrl.length > 0) {
                        this.verifyObj.uploadUrl.forEach((item) => {
                            if (!!~item.indexOf("maxSize")) {
                                fileLimitSize = Number(item.split(",")[1]);
                            }
                        });
                    }

                    if (fileLimitSize && fileLimitSize < file[0].size / 1024 / 1024) {
                        this.postMessageService.postMessage("showUploadMaxError");
                        this.file.nativeElement["value"] = "";
                        console.debug("檔案過大，請重新上傳");
                    } else {
                        const url = URL.createObjectURL(files[0]);
                        const audioElement = new Audio(url);
                        const parent = this;
                        const reader = new FileReader();
                        reader.readAsDataURL(files[0]);
                        reader.onload = () => {
                            files[0].src = reader.result;
                            const formData = new FormData();
                            const blobin = this.dataURLtoBlob(files[0].src);
                            formData.append("file", blobin, files[0].name);

                            if (!this.utilitiesService.getMockSession()) {
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
                            }
                            files[0].formData = formData;
                        };
                        this.fileName = files[0].name || "";
                        audioElement.addEventListener("loadedmetadata", () => {
                            files[0].duration = audioElement.duration * 1000;
                            parent.fileListObj = files;
                            parent.setResultState();
                            this.file.nativeElement["value"] = "";
                        });
                    }
                }
            } else {
                this.file.nativeElement["value"] = "";
                this.postMessageService.postMessage("showNotSupportError");
                console.debug("格式不相符，請重新上傳");
            }
        }
    }

    /**
     * on Open Upload
     *
     * @param {string} [mode='']
     * @memberof QaImageComponent
     */
    onOpenUpload(mode = "") {
        this.utilitiesService.openUpload(this.imgFile);
    }

    /**
     * upload Remove
     *
     * @param {*} evt
     * @param {string} [uploadType='image']
     * @memberof QaImageComponent
     */
    uploadRemove(evt) {
        evt.stopPropagation();

        this.imgFile.nativeElement["value"] = "";
        this.imageFrameBg = "";
        this.imgFileListObj = {};
    }

    /**
     * from dataURL to Blob
     *
     * @param {*} dataurl
     * @return {*}
     * @memberof QaAudioComponent
     */
    dataURLtoBlob(dataurl) {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1].replace(/\s/g, ""));
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime,
        });
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
     * append card content for load
     *
     * @memberof QaAudioComponent
     */
    appendToComponent() {
        this.changeDetectorRef.detach();
        const loadData = this.data.loadData;
        loadData.uploadMode = !!loadData.uploadMode ? loadData.uploadMode : "url";
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        if (!!this.audioUrl && loadData.uploadMode === "url") {
            this.isUploadFile = false;
            this.fileName = "";
            (this.audioUrl.nativeElement as HTMLInputElement).value = loadData.originalContentUrl;
        } else {
            if (!!~this.data.channel.indexOf("line"))
                this.filterAnswerByChannel(loadData, isCloneAction, "m4a", "LINE_LIMIT");
            else if (!!~this.data.channel.indexOf("google"))
                this.filterAnswerByChannel(loadData, isCloneAction, "mp3", "GOOGLE_LIMIT");
            else {
                if (loadData.originalContentUrl) {
                    this.isUploadFile = true;
                    this.fileName = loadData.name;
                    this.fileListObj[0] = {};
                    this.fileListObj[0].name = loadData.name;
                    this.fileListObj[0].size = loadData.size;
                    this.fileListObj[0].duration = loadData.duration;
                    this.fileListObj[0].src = loadData.originalContentUrl;
                    this.fileListObj[0].formData = loadData.gWUploadFormData;
                }
            }
        }

        if (!!~this.data.channel.indexOf("google") && !!this.imgTitle) {
            this.selectedImgMode = loadData.googleAudio["uploadMode"] || "url";
            (this.imgTitle.nativeElement as HTMLInputElement).value = loadData.googleAudio["imgTitle"] || "";
            (this.imgHint.nativeElement as HTMLInputElement).value = loadData.googleAudio["imgHint"] || "";

            if (!!this.imageUrl && loadData.googleAudio["uploadMode"] === "url")
                (this.imageUrl.nativeElement as HTMLInputElement).value = loadData.googleAudio["imageUrl"];
            else {
                if (
                    loadData.googleAudio["size"] &&
                    loadData.googleAudio["size"] !== "" &&
                    !Number(loadData.googleAudio["size"])
                )
                    loadData.googleAudio["size"] = this.parseStringSize(loadData.googleAudio["size"]);

                if (!!loadData.googleAudio["imageUrl"]) {
                    this.imageFrameBg = loadData.googleAudio["imageUrl"];
                    this.imgFileListObj = {
                        0: {
                            name: loadData.googleAudio["name"] || "",
                            width: loadData.googleAudio["width"],
                            height: loadData.googleAudio["height"],
                            size: loadData.googleAudio["size"] || 0,
                            src: loadData.googleAudio["imageUrl"],
                            formData: loadData.googleAudio["gWUploadFormData"] || "",
                        },
                    };
                    this.fileListImgObj = this.imgFileListObj;
                }
            }
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

    private filterAnswerByChannel(loadData: any, isCloneAction: boolean, fileType: string, tipMsg: string) {
        const splitName = loadData.name.split(".");
        if (splitName[splitName.length - 1].toLowerCase() === fileType && loadData.originalContentUrl) {
            if (loadData.originalContentUrl) {
                this.isUploadFile = true;
                this.fileName = loadData.name;
                this.fileListObj[0] = {};
                this.fileListObj[0].name = loadData.name;
                this.fileListObj[0].size = loadData.size;
                this.fileListObj[0].duration = loadData.duration;
                this.fileListObj[0].src = loadData.originalContentUrl;
                this.fileListObj[0].formData = loadData.gWUploadFormData;
            }
        } else {
            if (isCloneAction) {
                const wording = this.QA_EDITOR.AUDIO[tipMsg];
                if (!~this.qaEditorService.cloneMsgStack.indexOf(wording))
                    this.qaEditorService.cloneMsgStack.push(wording);
            } else {
                this.postMessageService.postMessage("doSweetAlert", {
                    type: "doSweetAlert",
                    data: {
                        type: "error",
                        title: this.QA_EDITOR.COMMON.ERROR,
                        text: this.QA_EDITOR.AUDIO[tipMsg],
                        confirmButtonText: this.QA_EDITOR.COMMON.COMFIRM,
                    },
                });
            }
        }
    }

    /**
     * set state of component
     *
     * @memberof QaAudioComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let url = "";
        const filesObj = !!Object.keys(this.fileListObj).length ? this.fileListObj : {};
        const fObject = !!filesObj[0] ? filesObj[0] : {};
        const filesImgObj = !!Object.keys(this.fileListImgObj).length ? this.fileListImgObj : {};
        const fImgObject = !!filesImgObj[0] ? filesImgObj[0] : {};

        let result = {};
        if (!!this.audioUrl) url = (this.audioUrl.nativeElement as HTMLInputElement).value || "";
        else this.isUploadFile = !!Object.keys(this.fileListObj).length;

        const googleAudio = {};
        if (!!~this.data.channel.indexOf("google") && !!this.imgTitle) {
            googleAudio["imgTitle"] = (this.imgTitle.nativeElement as HTMLInputElement).value || "";
            googleAudio["uploadMode"] = this.selectedImgMode;
            googleAudio["imageUrl"] =
                this.imageFrameBg || (this.imageUrl.nativeElement as HTMLInputElement).value || "";
            googleAudio["imgHint"] = (this.imgHint.nativeElement as HTMLInputElement).value || "";
            googleAudio["name"] = fImgObject.name || "image";
            googleAudio["width"] = this.selectedMode !== "url" ? fImgObject.width || 0 : 0;
            googleAudio["height"] = this.selectedMode !== "url" ? fImgObject.height || 0 : 0;
            googleAudio["size"] = this.selectedMode !== "url" ? fImgObject.size || 0 : 0;
            googleAudio["gWUploadFormData"] = this.selectedImgMode !== "url" ? fImgObject.formData || "" : "";
        }

        const channel = this.data.channel;
        const resultObj: IAnsAudioJson = {
            channelId: this.channelId,
            channel,
            type: "Audio",
            uploadMode: !!url ? "url" : "upload",
            originalContentUrl: !!url ? url : fObject.src || "",
            duration: !!url ? 0 : fObject.duration || 0,
            size: !!url ? "" : fObject.size || 0,
            name: !!url ? "" : fObject.name || "audio",
            gWUploadFormData: !!url ? "" : fObject.formData || "",
            version: "v770",
            googleAudio,
        };

        this.lastResultObj = resultObj;

        result = Object.assign(this.qaAudioObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaAudioService.setState({
                data: { result },
            });
        }
    }

    /**
     * lifecycle hook [ngOnInit]
     *
     * @memberof QaAudioComponent
     */
    ngOnInit(): void {
        if (!!~this.data.channel.indexOf("google")) this.qaEditorService.setGoogleAudio(this.data.channel);

        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.globalService$ = this.globalService.globalRxjs$.subscribe((resp) => {
            this.globalData = resp;
        });

        this.QaAudioState = this.qaAudioService.qaAudioState$.subscribe((resp) => {
            this.qaAudioObj = resp.data;
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
            if (this.data.loadData.uploadMode === "upload") this.selectedMode = "upload";
        }

        this.setResultState();
        this.isOninit = false;
    }

    /**
     * lifecycle hook [ngAfterViewChecked]
     *
     * @memberof QaAudioComponent
     */
    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    /**
     * lifecycle hook [ngOnDestroy]
     *
     * @memberof QaAudioComponent
     */
    ngOnDestroy(): void {
        if (!!this.QaAudioState) this.QaAudioState.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.globalService$) this.globalService$.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
        if (!!~this.data.channel.indexOf("google")) this.qaEditorService.setGoogleAudio("");
    }
}
