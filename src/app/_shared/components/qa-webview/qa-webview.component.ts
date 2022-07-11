import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { QaWebviewService, QaEditorService } from "@core/state";
import { IAnsWebviewJson } from "@core/state/qa-editor/answer-json.interface";
import { VerifyService } from "@core/services";

/**
 * QaWebview Component
 *
 * @export
 * @class QaWebviewComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-webview",
    templateUrl: "./qa-webview.component.html",
    styleUrls: ["./qa-webview.component.scss"],
})
export class QaWebviewComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private qaEditorService: QaEditorService,
        private qaWebviewService: QaWebviewService,
        private changeDetectorRef: ChangeDetectorRef,
        private verifyService: VerifyService
    ) {}

    /**
     * webview HTMLElement
     *
     * @type {ElementRef<HTMLElement>}
     * @memberof QaWebviewComponent
     */
    @ViewChild("webview") webview: ElementRef<HTMLElement>;

    @Input() data: any;

    channelId: string = "";

    currentTab: string = "web";

    isLoad = false;

    QaWebviewState: any;

    qaWebviewObj: any = {};

    qaEditorInfoObj: any = {};

    /**
     * initVerifyState
     *
     * @memberof QaWebviewComponent
     */
    initVerifyState = {
        state: true,
        errMsg: "",
    };

    /**
     * verifyState
     *
     * @type {*}
     * @memberof QaWebviewComponent
     */
    verifyState: any = {
        url: this.initVerifyState,
    };

    id = Math.random().toString(36).substring(7);

    SubIsSave: any;

    /**
     * verifyForm
     *
     * @memberof QaWebviewComponent
     */
    verifyForm() {
        if ((this.webview.nativeElement as HTMLInputElement).value.trim().length === 0) {
            this.verifyState.url = this.initVerifyState;
        } else {
            this.qaEditorService.setIsRequiredVerifyState({
                webView_isRequired: true,
                channel: this.data.channel,
            });

            this.verifyState["url"] = this.verifyService.verify(
                (this.webview.nativeElement as HTMLInputElement).value,
                ["hasHTTPS", "maxLength,1000"]
            );
            let result: boolean = true;

            Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
                if (item.state === false) result = false;
            });
            this.qaEditorService.setVerifyState({
                id: this.id,
                state: result,
                channel: this.data.channel,
                component: "webview",
            });
        }
    }

    /**
     * append To Component
     *
     * @memberof QaWebviewComponent
     */
    appendToComponent() {
        let loadData = this.data;

        (this.webview.nativeElement as HTMLInputElement).value = loadData.webViewUrl || "";

        // resolve from ngAfterViewChecked issue
        this.changeDetectorRef.detectChanges();

        this.setResultState();
    }

    /**
     * set Result State
     *
     * @returns
     * @memberof QaWebviewComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let result = {};
        let isWebview = this.qaWebviewObj.result;

        const channel = this.data.channel;
        if (!!channel) {
            const resultObj: IAnsWebviewJson = {
                channelId: this.channelId,
                channel,
                type: "Webview",
                webview: (this.webview.nativeElement as HTMLInputElement).value || "",
                version: "v770",
            };

            if (!resultObj.webview) {
                if (!!isWebview) {
                    if (!!isWebview[channel]) delete this.qaWebviewObj.result[channel];
                }
                return;
            }

            result = Object.assign(this.qaWebviewObj.result || {}, { [channel]: resultObj }, {});

            if (!!Object.keys(result).length) {
                this.qaWebviewService.setState({
                    data: { result },
                });
            }
        }
    }

    ngOnInit(): void {
        this.data.stateObject = this.qaEditorService.stateObject;
        this.isLoad = this.data.isLoad || false;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.QaWebviewState = this.qaWebviewService.qaWebviewState$.subscribe((resp) => {
            this.qaWebviewObj = resp.data || {};
        });

        this.SubIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.verifyForm();
        });
    }

    ngOnChanges(e) {
        if (!e.data.firstChange && !e.data.currentValue.isLoad) {
            (this.webview.nativeElement as HTMLInputElement).value = "";
            this.changeDetectorRef.detectChanges();
        }
    }

    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.QaWebviewState) this.QaWebviewState.unsubscribe();
        if (!!this.SubIsSave) this.SubIsSave.unsubscribe();
    }
}
