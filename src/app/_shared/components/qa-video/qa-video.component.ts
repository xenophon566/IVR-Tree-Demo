import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { QaEditorService, QaVideoService } from "@core/state";
import { GlobalService, SET_TIMEOUT } from "@core/services";
import { IAnsVideoJson } from "@core/state/qa-editor/answer-json.interface";
import { VerifyService } from "@core/services";
import { EditorService } from "@core/services/editor.service";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { CropperDialogComponent } from "@shared/components/dialog/cropper-dialog/cropper-dialog.component";
import { environment } from "@env/environment";

/**
 * QaVideo Component
 *
 * @export
 * @class QaVideoComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-video",
    templateUrl: "./qa-video.component.html",
    styleUrls: ["./qa-video.component.scss"],
})
export class QaVideoComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private nbDialogService: NbDialogService,
        private qaVideoService: QaVideoService,
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

    @ViewChild("uploadFile") uploadFile: ElementRef<HTMLElement>;
    @ViewChild("file") file: ElementRef<HTMLElement>;
    @ViewChild("previewFile") previewFile: ElementRef<HTMLElement>;
    @ViewChild("fileInfo") fileInfo: ElementRef<HTMLElement>;
    @ViewChild("videoUrl") videoUrl: ElementRef<HTMLElement>;
    @ViewChild("thumbnailUrl") thumbnailUrl: ElementRef<HTMLElement>;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    isOninit: boolean = false;

    selectedMode: string = "url";

    thumbnailSelectedMode: string = "url";

    globalService$: any;

    globalData: any;

    QaVideoState: any;

    qaVideoObj: any = {};

    fileListObj: any = {};

    thumbnailFileListObj: any = {};

    videoUploadUrl = "";

    previewUploadFrameBg = "";

    acceptFileType: string = ".mp4";

    thumbnailAcceptFileType: string = ".jpg,.jpeg,.png";

    sysThumbnailUrl: string = "";

    sysThumbnailFormData: any = "";

    subIsSave: any;

    subIsNeedVerify: any;

    lastResultObj: IAnsVideoJson;

    initVerifyState = {
        state: true,
        errMsg: "",
    };

    /**
     * verify State
     *
     * @type {*}
     * @memberof QaVideoComponent
     */
    verifyState: any = {
        videoUrl: this.initVerifyState,
        videoUpload: this.initVerifyState,
        thumbnailUrl: this.initVerifyState,
        thumbnailUpload: this.initVerifyState,
        thumbnailSystem: this.initVerifyState,
    };

    fileName: string = "";

    verifyObj = {
        video_Url: ["hasHTTPS", "maxLength,1000", "isRequired"],
        video_Upload: ["maxSize,10", "isRequired"],
        thumbnail_Url: ["hasHTTPS", "maxLength,1000", "isRequired"],
        thumbnail_Upload: ["maxSize,1", "isRequired"],
        thumbnail_System: ["isRequired"],
    };

    /**
     * append To Component
     *
     * @memberof QaVideoComponent
     */
    appendToComponent() {
        this.changeDetectorRef.detach();
        const loadData = this.data.loadData;
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        // Video Load Data
        loadData.uploadMode = !!loadData.uploadMode ? loadData.uploadMode : "url";
        switch (loadData.uploadMode) {
            case "url":
                this.fileName = "";
                (this.videoUrl.nativeElement as HTMLInputElement).value = loadData.originalContentUrl;
                break;
            case "upload":
                if (loadData.originalContentUrl) {
                    // Because VerifyForm need check size,we need to give value.
                    this.fileListObj[0] = {
                        size: 1,
                        name: loadData.name,
                        formData: loadData.gWUploadFormData || "",
                    };
                    this.videoUploadUrl = loadData.originalContentUrl;
                    this.fileName = loadData.name;
                }
                break;
        }

        // Thumbnail Load Data
        loadData.thumbnailMode = !!loadData.thumbnailMode ? loadData.thumbnailMode : "url";
        this.thumbnailSelectedMode = loadData.thumbnailMode;
        this.sysThumbnailUrl = loadData.sysThumbnailUrl;
        switch (loadData.thumbnailMode) {
            case "system":
                this.sysThumbnailFormData = loadData.gWUploadSysFormData;
                break;
            case "url":
                (this.thumbnailUrl.nativeElement as HTMLInputElement).value = loadData.thumbnailUrl;
                break;
            case "upload":
                if (loadData.thumbnailUrl) {
                    // Because VerifyForm need check size,we need to give value.
                    this.thumbnailFileListObj[0] = {
                        size: 1,
                        isLoad: true,
                        formData: loadData.gWUploadThumbnailFormData || "",
                    };
                    this.previewUploadFrameBg = loadData.thumbnailUrl;
                }
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
     * set Init Verify State
     *
     * @memberof QaVideoComponent
     */
    setInitVerifyState() {
        this.verifyState = {
            videoUrl: this.initVerifyState,
            videoUpload: this.initVerifyState,
            thumbnailUrl: this.initVerifyState,
            thumbnailUpload: this.initVerifyState,
            thumbnailSystem: this.initVerifyState,
        };
    }

    /**
     * verify Form
     *
     * @memberof QaVideoComponent
     */
    verifyForm() {
        this.setInitVerifyState();
        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web") && !!this.lastResultObj)
            this.isAllEmpty();

        if (this.selectedMode === "url") {
            // Video Url
            this.verifyState["videoUrl"] = this.verifyService.verify(
                (this.videoUrl.nativeElement as HTMLInputElement).value,
                this.verifyObj.video_Url
            );
        } else {
            // Video Upload
            let fileSize = "";
            if (Object.keys(this.fileListObj).length === 0) fileSize = "";
            else fileSize = (this.fileListObj[0].size / 1024 / 1024).toString(); // Unit : MB

            this.verifyState["videoUpload"] = this.verifyService.verify(fileSize, this.verifyObj.video_Upload);
        }

        if (this.data.channel !== "messenger")
            switch (this.thumbnailSelectedMode) {
                case "url":
                    // Thumbnail Url
                    this.verifyState["thumbnailUrl"] = this.verifyService.verify(
                        (this.thumbnailUrl.nativeElement as HTMLInputElement).value,
                        this.verifyObj.thumbnail_Url
                    );
                    break;
                case "upload":
                    // Thumbnail Upload

                    let fileSize = "";
                    if (Object.keys(this.thumbnailFileListObj).length === 0) {
                        fileSize = "";
                    } else {
                        // MB
                        fileSize = (this.thumbnailFileListObj[0].size / 1024 / 1024).toString();
                    }

                    this.verifyState["thumbnailUpload"] = this.verifyService.verify(
                        fileSize,
                        this.verifyObj.thumbnail_Upload
                    );
                    break;
                case "system":
                    this.verifyState["thumbnailUpload"] = this.initVerifyState;
                    this.verifyState["thumbnailUrl"] = this.initVerifyState;
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
            component: "video",
        });
    }

    /**
     * mode Change
     *
     * @memberof QaVideoComponent
     */
    modeChange() {
        this.changeDetectorRef.detectChanges();
        switch (this.selectedMode) {
            case "url":
                this.thumbnailSelectedMode = "url";
                break;
            case "upload":
                this.thumbnailSelectedMode = "system";
                break;
        }

        this.setInitVerifyState();
        this.fileName = "";
        this.videoUploadUrl = "";
        this.sysThumbnailUrl = "";
        this.thumbnailFileListObj = {};
        this.fileListObj = {};
        this.changeDetectorRef.detectChanges();

        if (!!this.thumbnailUrl) (this.thumbnailUrl.nativeElement as HTMLInputElement).value = "";
    }

    /**
     * thumbnail Mode Change
     *
     * @memberof QaVideoComponent
     */
    thumbnailModeChange() {
        if (this.thumbnailSelectedMode !== "upload") {
            this.thumbnailFileListObj = {};
        }
    }

    /**
     * upload Frame
     *
     * @memberof QaVideoComponent
     */
    uploadFrame() {
        const el: HTMLElement = this.file.nativeElement;
        el.click();
    }

    /**
     * upload Preview Frame
     *
     * @memberof QaVideoComponent
     */
    uploadPreviewFrame() {
        const el: HTMLElement = this.previewFile.nativeElement;
        el.click();
    }

    /**
     * upload
     *
     * @param {*} file
     * @memberof QaVideoComponent
     */
    upload(file) {
        if (!!file.length) {
            const files = Object.assign({}, file || {});
            const fileName = files[0].name;
            const splitFileName = fileName.split(".");
            const subFileName = splitFileName[splitFileName.length - 1];
            if (!!~this.acceptFileType.indexOf(subFileName.toLowerCase())) {
                let fileLimitSize;
                if (this.verifyObj.video_Upload && this.verifyObj.video_Upload.length > 0) {
                    this.verifyObj.video_Upload.forEach((item) => {
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
                    this.sysThumbnail(files);
                    const formData = new FormData();
                    formData.append("file", files[0], files[0].name);
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
                    this.fileName = files[0].name || "";
                    this.videoUploadUrl = URL.createObjectURL(files[0]);
                    this.fileListObj = files;
                    this.file.nativeElement["value"] = "";
                    this.setResultState();
                }
            } else {
                this.file.nativeElement["value"] = "";
                this.postMessageService.postMessage("showNotSupportError");
                console.debug("格式不相符，請重新上傳");
            }
        }
    }

    /**
     * system Thumbnail
     *
     * @param {*} files
     * @memberof QaVideoComponent
     */
    sysThumbnail(files) {
        this.generateThumbnail(files[0])
            .then((thumbnailData) => {
                this.sysThumbnailUrl = thumbnailData;
                const formData = new FormData();
                const blobBin = this.dataURLtoBlob(thumbnailData);
                console.log(blobBin);
                console.log(files[0].name);
                const extension = /[.]/.exec(files[0].name) ? /[^.]+$/.exec(files[0].name)[0] : undefined;
                const filesName = files[0].name.replace(extension, "png");
                console.log(filesName);
                formData.append("file", blobBin, filesName);
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
                this.sysThumbnailFormData = formData;
            })
            .catch((e) => {
                console.debug("產生系統生成時發生異常");
                this.fileName = "";
                this.videoUploadUrl = "";
                this.fileListObj = {};
                this.sysThumbnailFormData = "";
                this.sysThumbnailUrl = "";
                this.postMessageService.postMessage("doSweetAlert", {
                    type: "doSweetAlert",
                    data: {
                        title: this.QA_EDITOR.COMMON.ERROR,
                        text: this.QA_EDITOR.COMMON.DAMAGED_FILE,
                        type: "error",
                        confirmButtonText: this.QA_EDITOR.COMMON.COMFIRM,
                    },
                });
            });
    }

    /**
     * upload Preview image
     *
     * @param {*} $event
     * @memberof QaVideoComponent
     */
    uploadPreviewImg($event: any): void {
        if (!!$event.target.value) {
            const filePath = $event.target.value;
            const filePathArr = filePath.split(".");
            const imageFormat = filePathArr[filePathArr.length - 1];
            const fileInfo = $event.target.files[0];

            if (!!~this.thumbnailAcceptFileType.indexOf(imageFormat.toLowerCase())) {
                let fileLimitSize;
                if (this.verifyObj.thumbnail_Upload && this.verifyObj.thumbnail_Upload.length > 0) {
                    this.verifyObj.thumbnail_Upload.forEach((item) => {
                        if (!!~item.indexOf("maxSize")) {
                            fileLimitSize = Number(item.split(",")[1]);
                        }
                    });
                }

                if (fileLimitSize && fileLimitSize < fileInfo.size / 1024 / 1024) {
                    this.postMessageService.postMessage("showUploadMaxError");
                    $event.target.value = "";
                    console.debug("檔案過大，請重新上傳");
                } else {
                    this.nbDialogService
                        .open(CropperDialogComponent, {
                            context: {
                                imageFiles: $event.target.files[0],
                                componentType: "VideoImage",
                            },
                        })
                        .onClose.subscribe((dialogResp) => {
                            if (!!dialogResp && dialogResp.action === "confirm") {
                                this.imageUpload($event, dialogResp.croppedImage);
                            } else if (!!dialogResp && dialogResp.action === "reset") {
                                $event.target.value = "";
                                const el: HTMLElement = this.previewFile.nativeElement;
                                el.click();
                            } else $event.target.value = "";
                        });
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
     * @memberof QaVideoComponent
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

        this.previewUploadFrameBg = croppedImage.blobUrl;
        this.thumbnailFileListObj = files;
        this.previewFile.nativeElement["value"] = "";

        this.setResultState();
    }

    /**
     * dataURL to Blob
     *
     * @param {*} dataurl
     * @returns
     * @memberof QaVideoComponent
     */
    dataURLtoBlob(dataurl) {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1]; // 结果：   image/png
        const bstr = atob(arr[1].replace(/\s/g, ""));
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime,
        }); // 值，類型
    }

    /**
     * generate Thumbnail
     *
     * @param {Blob} videoFile
     * @returns {Promise<string>}
     * @memberof QaVideoComponent
     */
    public generateThumbnail(videoFile: Blob): Promise<string> {
        const video: HTMLVideoElement = document.createElement("video");
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const context: CanvasRenderingContext2D = canvas.getContext("2d");
        return new Promise<string>((resolve, reject) => {
            canvas.addEventListener("error", reject);
            video.addEventListener("error", reject);
            video.addEventListener("canplay", (event) => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                resolve(canvas.toDataURL());
            });
            if (videoFile.type) {
                video.setAttribute("type", videoFile.type);
            }
            video.preload = "auto";
            video.src = window.URL.createObjectURL(videoFile);
            video.load();
        });
    }

    /**
     * is All Empty
     *
     * @private
     * @memberof QaVideoComponent
     */
    private isAllEmpty() {
        const isAllEmptyFlag =
            !this.lastResultObj.originalContentUrl &&
            !this.lastResultObj.gWUploadFormData &&
            !this.lastResultObj.gWUploadThumbnailFormData &&
            !this.lastResultObj.thumbnailUrl;

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
     * @memberof QaVideoComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let originalContentUrl = "";
        let thumbnailUrl = "";
        let gWUploadThumbnailFormData = "";
        let gWUploadSysFormData = "";
        const filesObj = !!Object.keys(this.fileListObj).length ? this.fileListObj : {};
        const fObject = !!filesObj[0] ? filesObj[0] : {};
        let result = {};

        switch (this.selectedMode) {
            case "url":
                if (!!this.videoUrl) originalContentUrl = (this.videoUrl.nativeElement as HTMLInputElement).value || "";
                break;
            case "upload":
                originalContentUrl = this.videoUploadUrl;
                gWUploadSysFormData = originalContentUrl ? this.sysThumbnailFormData || "" : "";
                break;
        }

        switch (this.thumbnailSelectedMode) {
            case "system":
                if (originalContentUrl) {
                    thumbnailUrl = this.sysThumbnailUrl;
                    gWUploadThumbnailFormData = this.sysThumbnailFormData || "";
                } else {
                    thumbnailUrl = "";
                    gWUploadThumbnailFormData = "";
                }
                break;
            case "url":
                if (!!this.thumbnailUrl)
                    thumbnailUrl = (this.thumbnailUrl.nativeElement as HTMLInputElement).value || "";
                break;
            case "upload":
                thumbnailUrl = this.previewUploadFrameBg;

                if (!!this.thumbnailFileListObj[0] && !this.thumbnailFileListObj[0].isLoad)
                    gWUploadThumbnailFormData = this.thumbnailFileListObj[0].formData || "";

                break;
        }

        const channel = this.data.channel;
        const resultObj: IAnsVideoJson = {
            channelId: this.channelId,
            channel,
            type: "Video",
            uploadMode: this.selectedMode,
            name: this.fileName || "video",
            originalContentUrl,
            thumbnailMode: this.thumbnailSelectedMode,
            thumbnailUrl,
            sysThumbnailUrl: this.selectedMode === "upload" && originalContentUrl ? this.sysThumbnailUrl || "" : "",
            gWUploadFormData: !fObject.formData ? "" : fObject.formData || "",
            gWUploadThumbnailFormData,
            gWUploadSysFormData,
            version: "v770",
        };

        this.lastResultObj = resultObj;
        result = Object.assign(this.qaVideoObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaVideoService.setState({
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

        this.QaVideoState = this.qaVideoService.qaVideoState$.subscribe((resp) => {
            this.qaVideoObj = resp.data;
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
            // Because we need  Change select before we update thumbnailMode.
            if (this.data.loadData.uploadMode === "upload") this.selectedMode = "upload";
        }

        this.setResultState();
        this.isOninit = false;
    }

    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.QaVideoState) this.QaVideoState.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
        if (!!this.globalService$) this.globalService$.unsubscribe();
    }
}
