import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import { VerifyService } from "@core/services";
import { QaEditorService, QaLinkService } from "@core/state";
import { IAnsExternalJson } from "@core/state/qa-editor/answer-json.interface";
import { LanguageService, PostMessageService } from "@core/utils";

/**
 * QaLink Component
 *
 * @export
 * @class QaLinkComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-link",
    templateUrl: "./qa-link.component.html",
    styleUrls: ["./qa-link.component.scss"],
})
export class QaLinkComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private postMessageService: PostMessageService,
        private qaLinkService: QaLinkService,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    @ViewChild("link") link: ElementRef<HTMLElement>;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    QaLinkState: any;

    qaLinkObj: any = {};

    /**
     * verify State
     *
     * @type {*}
     * @memberof QaLinkComponent
     */
    verifyState: any = {
        link: {
            state: true,
            errMsg: "",
        },
    };

    verifyAry = ["hasHTTP", "maxLength,1000", "isRequired"];

    SubIsSave: any;

    SubIsNeedVerify: any;

    isOninit: any;

    /**
     * verify Form
     *
     * @memberof QaLinkComponent
     */
    verifyForm() {
        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web")) {
            if ((this.link.nativeElement as HTMLInputElement).value.length > 0)
                this.qaEditorService.setIsRequiredVerifyState({
                    external_isRequired: true,
                    channel: this.data.channel,
                });
            else
                this.qaEditorService.setIsRequiredVerifyState({
                    external_isRequired: false,
                    channel: this.data.channel,
                });
        }

        if (this.data.module === "qa-editor" && this.data.channel === "web" && !this.qaEditorService.isRequiredVerify) {
            if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
        } else if (!~this.verifyAry.indexOf("isRequired")) {
            this.verifyAry.push("isRequired");
        }

        this.verifyState["link"] = this.verifyService.verify(
            (this.link.nativeElement as HTMLInputElement).value,
            this.verifyAry
        );
        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });
        this.qaEditorService.setVerifyState({
            id: this.data.id,
            state: result,
            channel: this.data.channel,
            component: "link",
        });
    }

    /**
     * append To Component
     *
     * @memberof QaLinkComponent
     */
    appendToComponent() {
        let loadData = this.data.loadData;
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        (this.link.nativeElement as HTMLInputElement).value = loadData.url;

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
     * @memberof QaLinkComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let result = {};
        const channel = this.data.channel;
        const resultObj: IAnsExternalJson = {
            channelId: this.channelId,
            channel,
            type: "External",
            url: this.link ? (this.link.nativeElement as HTMLInputElement).value || "" : "",
            version: "v770",
        };

        result = Object.assign(this.qaLinkObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaLinkService.setState({
                data: { result },
            });
        }
    }

    ngOnInit(): void {
        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.QaLinkState = this.qaLinkService.qaLinkState$.subscribe((resp) => {
            this.qaLinkObj = resp.data;
        });

        this.SubIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.verifyForm();
        });

        this.SubIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
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
        if (!!this.QaLinkState) this.QaLinkState.unsubscribe();
        if (!!this.SubIsSave) this.SubIsSave.unsubscribe();
        if (!!this.SubIsNeedVerify) this.SubIsNeedVerify.unsubscribe();
    }
}
