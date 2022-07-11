import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import { VerifyService } from "@core/services";
import { QaEditorService, QaQuoteService } from "@core/state";
import { IAnsQuote } from "@core/state/qa-editor/answer-json.interface";
import { LanguageService, PostMessageService } from "@core/utils";

@Component({
    selector: "cbe-qa-quote",
    templateUrl: "./qa-quote.component.html",
    styleUrls: ["./qa-quote.component.scss"],
})
export class QaQuoteComponent implements OnInit {
    constructor(
        private postMessageService: PostMessageService,
        private qaQuoteService: QaQuoteService,
        private qaEditorService: QaEditorService,
        private verifyService: VerifyService,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    @ViewChild("quote") quote: ElementRef<HTMLElement>;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    QaQuoteState: any;

    qaQuoteObj: any = {};

    /**
     * related to Smart QA data
     *
     * @type {*}
     * @memberof QaQuoteComponent
     */
    qaQuoteQAData: any;

    subQuoteQAData: any;

    /**
     * verify state
     *
     * @type {*}
     * @memberof QaQuoteComponent
     */
    verifyState: any = {
        quote: {
            state: true,
            errMsg: "",
        },
    };

    verifyAry = ["isRequired"];

    SubIsSave: any;

    SubIsNeedVerify: any;

    isOninit: any;

    /**
     * verify Form
     *
     * @memberof QaQuoteComponent
     */
    verifyForm() {
        // Against web channl  in qa-editor doesn't check isRequired.
        if (this.data.module === "qa-editor" && !!~this.data.channel.indexOf("web")) {
            if ((this.quote.nativeElement as HTMLInputElement).value.length > 0)
                this.qaEditorService.setIsRequiredVerifyState({
                    quote_isRequired: true,
                    channel: this.data.channel,
                });
            else
                this.qaEditorService.setIsRequiredVerifyState({
                    quote_isRequired: false,
                    channel: this.data.channel,
                });
        }

        if (this.data.module === "qa-editor" && this.data.channel === "web" && !this.qaEditorService.isRequiredVerify) {
            if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
        } else if (!~this.verifyAry.indexOf("isRequired")) {
            this.verifyAry.push("isRequired");
        }

        this.verifyState["quote"] = this.verifyService.verify(
            (this.quote.nativeElement as HTMLInputElement).value,
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
            component: "quote",
        });
    }

    /**
     * append To Component
     *
     * @memberof QaQuoteComponent
     */
    appendToComponent() {
        const loadData = this.data.loadData;
        let name: any = "";
        try {
            name = new Map(JSON.parse(localStorage.getItem("mapSmartQA"))).get(loadData.content.keyId);
        } catch (exception) {
            name = !loadData.content?.name ? loadData.content?.name : "";
        }
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        (this.quote.nativeElement as HTMLInputElement).value = !!name ? name : "";

        if (!!name) this.qaQuoteQAData = this.data.loadData.content;

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

    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let result = {};
        const channel = this.data.channel;
        const resultObj: IAnsQuote = {
            channelId: this.channelId,
            channel,
            type: "Quote",
            content: this.qaQuoteQAData,
            version: "v803",
        };

        result = Object.assign(this.qaQuoteObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaQuoteService.setState({
                data: { result },
            });
        }
    }

    /**
     *
     *
     * @param {*} item
     * @memberof QaQuoteComponent
     */
    openSmartQAList() {
        // Here to PostMessage to Old CBE.
        this.postMessageService.postMessage("custom", {
            type: "openSmartQAListFromQuote",
            // id: item.id,
            id: this.componentId,
            page:
                this.data.openEditor === "greeting"
                    ? "greetingIFrame"
                    : localStorage.getItem("botType") === "qbipro"
                    ? "qaProIFrame"
                    : "icrIFrame",
        });
    }

    // setQACode(value, id) {
    //   // send Old CBE callback data here to append to UI.
    //   const data = Object.assign({}, value);
    //   this.replyBtnAry.forEach((item) => {
    //       if (item.id === id) {
    //           data.type = 'QA';
    //           item.qaCode = JSON.stringify(data);
    //           item.qaName = value.name;
    //           item.qaDisplayText = value.name;
    //           this.changeDetectorRef.detectChanges();
    //       }
    //   });
    //   if (this.data.module === 'qa-editor') this.smartQaEditorService.clearReplyQAData();
    //   else {
    //       this.greetingEditorService.clearReplyQAData();
    //       this.satisfactionSurveyEditorService.clearReplyQAData();
    //   }
    // }

    ngOnInit(): void {
        this.isOninit = true;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) {
            this.channelId = this.data.loadData.channelId || "";
            // this.qaQuoteQAData = this.data.loadData.content;
        }

        this.QaQuoteState = this.qaQuoteService.qaQuoteState$.subscribe((resp) => {
            this.qaQuoteObj = resp.data;
        });

        this.subQuoteQAData = this.qaEditorService.quoteQAData$.subscribe((resp) => {
            if (resp.length > 0) {
                if (this.componentId === resp[1]) {
                    this.qaQuoteQAData = resp[0];
                    (this.quote.nativeElement as HTMLInputElement).value = this.qaQuoteQAData.name;
                }
                console.log(resp[0], resp[1]);
                // this.qaEditorService.clearQuoteQAData();
            }
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
        if (!!this.QaQuoteState) this.QaQuoteState.unsubscribe();
        if (!!this.subQuoteQAData) this.subQuoteQAData.unsubscribe();
        if (!!this.SubIsSave) this.SubIsSave.unsubscribe();
        if (!!this.SubIsNeedVerify) this.SubIsNeedVerify.unsubscribe();
    }
}
