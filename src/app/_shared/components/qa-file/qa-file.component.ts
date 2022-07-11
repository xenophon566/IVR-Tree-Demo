import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { GlobalService, SET_TIMEOUT, VerifyService } from "@core/services";
import { QaEditorService, QaFileService } from "@core/state";
import { IAnsFileJson } from "@core/state/qa-editor/answer-json.interface";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { EditorService } from "@core/services/editor.service";
import { environment } from "@env/environment";

/**
 * QaFile Component
 *
 * @export
 * @class QaFileComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-file",
    templateUrl: "./qa-file.component.html",
    styleUrls: ["./qa-file.component.scss"],
})
export class QaFileComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private qaFileService: QaFileService,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private changeDetectorRef: ChangeDetectorRef,
        private globalService: GlobalService,
        private utilitiesService: UtilitiesService,
        private postMessageService: PostMessageService,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    @ViewChild("uploadFile") uploadFile: ElementRef<HTMLElement>;
    @ViewChild("file") file: ElementRef<HTMLElement>;
    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    globalService$: any;

    globalData: any;

    QaFileState: any;

    qaFileObj: any = {};

    fileListObj: any = {};

    uploadFrameBg = "./assets/images/file.jpg";

    acceptFileType: string = ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.txt,.m4a,.mp4,.mp3";

    /**
     * verify State
     *
     * @type {*}
     * @memberof QaFileComponent
     */
    verifyState: any = {
        file: {
            state: true,
            errMsg: "",
        },
    };

    fileName: string = "";

    subIsSave: any;

    subIsNeedVerify: any;

    isOninit: boolean = false;

    verifyAry = ["maxSize,3", "isRequired"];

    downloadVisible: boolean = false;

    /**
     * is All Empty
     *
     * @private
     * @memberof QaFileComponent
     */
    private isAllEmpty() {
        const isAllEmptyFlag = Object.keys(this.fileListObj).length === 0;

        if (isAllEmptyFlag)
            this.qaEditorService.setIsRequiredVerifyState({
                file_isRequired: false,
                channel: this.data.channel,
            });
        else
            this.qaEditorService.setIsRequiredVerifyState({
                file_isRequired: true,
                channel: this.data.channel,
            });

        if (this.data.channel === "web") {
            if (isAllEmptyFlag && !this.qaEditorService.isRequiredVerify) {
                if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
            } else if (!~this.verifyAry.indexOf("isRequired")) this.verifyAry.push("isRequired");
        }
    }

    /**
     * verify Form
     *
     * @memberof QaFileComponent
     */
    verifyForm() {
        let fileSize = "";
        if (Object.keys(this.fileListObj).length === 0) fileSize = "";
        else fileSize = (this.fileListObj[0].size / 1024 / 1024).toString(); // Unit:MB

        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web")) {
            this.isAllEmpty();
        }

        this.verifyState["file"] = this.verifyService.verify(fileSize, this.verifyAry);

        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });
        this.qaEditorService.setVerifyState({
            id: this.data.id,
            state: result,
            channel: this.data.channel,
            component: "file",
        });
    }

    /**
     * upload Frame
     *
     * @memberof QaFileComponent
     */
    uploadFrame() {
        let el: HTMLElement = this.file.nativeElement;
        el.click();
    }

    /**
     * upload
     *
     * @param {*} file
     * @memberof QaFileComponent
     */
    upload(file) {
        if (!!file.length) {
            let files = Object.assign({}, file || {});
            let fileName = files[0].name;
            let splitFileName = fileName.split(".");
            let subFileName = splitFileName[splitFileName.length - 1];

            if (!!~this.acceptFileType.indexOf(subFileName.toLowerCase())) {
                let fileLimitSize;
                if (this.verifyAry && this.verifyAry.length > 0) {
                    this.verifyAry.forEach((item) => {
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
                    this.fileListObj = files;
                    this.file.nativeElement["value"] = "";
                    this.downloadVisible = false;
                    this.setResultState();
                }
            } else {
                this.postMessageService.postMessage("showNotSupportError");
                this.file.nativeElement["value"] = "";
                console.debug("格式不相符，請重新上傳");
            }
        }
    }

    /**
     * append To Component
     *
     * @memberof QaFileComponent
     */
    appendToComponent() {
        this.changeDetectorRef.detach();
        let loadData = this.data.loadData;
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        this.fileName = loadData.name;
        if (loadData.url || loadData.name) {
            this.fileListObj = {
                0: {
                    name: loadData.name,
                    size: loadData.size,
                    src: loadData.url || "",
                    formData: loadData.gWUploadFormData || "",
                },
            };
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
        } else if (loadData) this.downloadVisible = true;

        // resolve from ngAfterViewChecked issue
        setTimeout(() => {
            this.changeDetectorRef.reattach();
        }, SET_TIMEOUT.REATTACH);
    }

    /**
     * set Result State
     *
     * @memberof QaFileComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let filesObj = !!Object.keys(this.fileListObj).length ? this.fileListObj : {};
        const fObject = !!filesObj[0] ? filesObj[0] : {};
        let result = {};
        const channel = this.data.channel;
        const resultObj: IAnsFileJson = {
            channelId: this.channelId,
            channel,
            type: "File",
            version: "v770",
            name: fObject.name || this.fileName || "",
            size: fObject.size || 0,
            url: fObject.src || "",
            gWUploadFormData: fObject.formData || "",
        };

        result = Object.assign(this.qaFileObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaFileService.setState({
                data: { result },
            });
        }
    }

    /**
     * download
     *
     * @param {*} url
     * @memberof QaFileComponent
     */
    download(url) {
        if (url) window.open(url);
        else console.debug("Download Url is invalid.");
    }

    ngOnInit(): void {
        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.globalService$ = this.globalService.globalRxjs$.subscribe((resp) => {
            this.globalData = resp;
        });

        this.QaFileState = this.qaFileService.qaFileState$.subscribe((resp) => {
            this.qaFileObj = resp.data;
        });

        this.subIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.verifyForm();
        });

        this.subIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
            if (resp && !this.isOninit) this.verifyForm();
        });

        if (!!this.data.loadData) {
            this.isLoad = true;
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
        if (!!this.QaFileState) this.QaFileState.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
        if (!!this.globalService$) this.globalService$.unsubscribe();
    }
}
