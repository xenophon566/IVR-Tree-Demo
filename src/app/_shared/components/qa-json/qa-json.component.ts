import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import { VerifyService } from "@core/services";
import { QaEditorService, QaJsonService } from "@core/state";
import { IAnsJson } from "@core/state/qa-editor/answer-json.interface";
import { LanguageService, PostMessageService } from "@core/utils";

/**
 * QaJson Component
 *
 * @export
 * @class QaJsonComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-json",
    templateUrl: "./qa-json.component.html",
    styleUrls: ["./qa-json.component.scss"],
})
export class QaJsonComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private postMessageService: PostMessageService,
        private qaJsonService: QaJsonService,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    @ViewChild("jsonContent") jsonContent: ElementRef<HTMLElement>;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    QaJsonState: any;

    qaJsonObj: any = {};

    subIsSave: any;

    subIsNeedVerify: any;

    isOninit: any;

    /**
     * verify State
     *
     * @type {*}
     * @memberof QaJsonComponent
     */
    verifyState: any = {
        json: {
            state: true,
            errMsg: "",
        },
    };

    verifyAry = ["isRequired"];

    /**
     * verify Form
     *
     * @memberof QaJsonComponent
     */
    verifyForm() {
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web")) {
            if ((this.jsonContent.nativeElement as HTMLInputElement).value.length > 0)
                this.qaEditorService.setIsRequiredVerifyState({
                    json_isRequired: true,
                    channel: this.data.channel,
                });
            else
                this.qaEditorService.setIsRequiredVerifyState({
                    json_isRequired: false,
                    channel: this.data.channel,
                });
        }

        if (this.data.module === "qa-editor" && this.data.channel === "web" && !this.qaEditorService.isRequiredVerify) {
            if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
        } else if (!~this.verifyAry.indexOf("isRequired")) {
            this.verifyAry.push("isRequired");
        }

        this.verifyState = {
            json: this.verifyService.verify((this.jsonContent.nativeElement as HTMLInputElement).value, this.verifyAry),
        };

        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });
        this.qaEditorService.setVerifyState({
            id: this.data.id,
            state: result,
            channel: this.data.channel,
            component: "json",
        });
    }

    /**
     * append To Component
     *
     * @memberof QaJsonComponent
     */
    appendToComponent() {
        let loadData = this.data.loadData;
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        (this.jsonContent.nativeElement as HTMLInputElement).value = loadData.content;

        if (isCloneAction) {
            this.qaEditorService.cloneCount--;

            if (!this.qaEditorService.cloneCount) {
                this.postMessageService.postMessage("custom", {
                    type: "loaderHide",
                });

                this.qaEditorService.cloneCount = 0;
                this.qaEditorService.cloneMsgStack = [];
            }
        }
    }

    /**
     * set Result State
     *
     * @memberof QaJsonComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let result = {};
        const channel = this.data.channel;
        let json: IAnsJson = {
            channelId: this.channelId,
            channel,
            type: "Json",
            version: "v770",
            content: this.jsonContent ? (this.jsonContent.nativeElement as HTMLInputElement).value || "" : "",
        };

        result = Object.assign(this.qaJsonObj.result || {}, { [this.data.id]: json }, {});

        if (!!Object.keys(result).length) {
            this.qaJsonService.setState({
                data: { result },
            });
        }
    }

    ngOnInit(): void {
        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.QaJsonState = this.qaJsonService.qaJsonState$.subscribe((resp) => {
            this.qaJsonObj = resp.data;
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
        if (!!this.QaJsonState) this.QaJsonState.unsubscribe();
        if (!!this.subIsSave) this.subIsSave.unsubscribe();
        if (!!this.subIsNeedVerify) this.subIsNeedVerify.unsubscribe();
    }
}
