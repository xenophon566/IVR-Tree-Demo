import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
} from "@angular/core";
import { SET_TIMEOUT, VerifyService } from "@core/services";
import { QaEditorService, QaTextService } from "@core/state";
import { TextareaLoaderDirective } from "@shared/directives/textarea-loader.directive";
import { TextareaComponent } from "@shared/components/textarea/textarea.component";
import { IAnsTextJson } from "@core/state/qa-editor/answer-json.interface";
import { EditorService } from "@core/services/editor.service";
import { LanguageService, PostMessageService } from "@core/utils";

/**
 * TEXTAREA 的基本常數設定
 *
 * @enum {number}
 */
const enum TEXT {
    TEXTAREA_MAX = 6,
    TEXTAREA_MIN = 2,
}

/**
 * QaText Component
 *
 * @export
 * @class QaTextComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-text",
    templateUrl: "./qa-text.component.html",
    styleUrls: ["./qa-text.component.scss"],
})
export class QaTextComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private verifyService: VerifyService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private qaTextService: QaTextService,
        private changeDetectorRef: ChangeDetectorRef,
        private qaEditorService: QaEditorService,
        private postMessageService: PostMessageService,
        private languageService: LanguageService
    ) {
        this.languageService.language$.subscribe((resp) => {
            this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        });
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    @ViewChild("body") body: ElementRef;

    @ViewChild(TextareaLoaderDirective, { static: true })
    cbeSharedTextareaLoader: TextareaLoaderDirective;

    @ViewChild("text") text: ElementRef<HTMLElement>;

    @Input() data: any;

    @Input() isOperatorHide: boolean = false;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isShowRandom = "flex";

    isLoad = false;

    QaTextState: any;

    qaTextObj: any = {};

    toggleChecked: boolean = false;

    count: number = 0;

    textareaArr = [];

    viewContainerRefArr = [];

    isMaxCount: boolean = false;

    id = Math.random().toString(36).substring(7);

    isOninit: boolean = false;

    verifyState: any = {
        text: {
            state: true,
            errMsg: "",
        },
    };

    SubIsSave: any;

    SubIsNeedVerify: any;

    verifyAry = ["maxLength,100", "isRequired"];

    googleDefField = false;

    verifyForm() {
        if (!this.text) return;

        // qa-text check input for [Google]
        if (this.data.openEditor === "smart-qa" && !this.qaEditorService.isRequiredVerify) {
            if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
        } else if (!~this.verifyAry.indexOf("isRequired")) this.verifyAry.push("isRequired");

        if (!!~this.data.channel.indexOf("google")) this.verifyAry.push("isRequired");

        this.verifyState = {
            text: this.verifyService.verify((this.text.nativeElement as HTMLInputElement).value, this.verifyAry),
        };

        let result: boolean = true;

        Object.values(this.verifyState).forEach((item: { state: boolean; errMsg: string }) => {
            if (item.state === false) result = false;
        });

        this.qaEditorService.setVerifyState({
            id: this.id,
            state: result,
            channel: this.data.channel,
            component: "textarea",
        });
    }

    /**
     * load Component
     *
     * @param {*} component
     * @memberof QaTextComponent
     */
    loadComponent(component) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const viewContainerRef = this.cbeSharedTextareaLoader.viewContainerRef;
        const componentRef = viewContainerRef.createComponent(componentFactory);

        if (this.data.module === "greeting-editor") this.isShowRandom = "none";

        (componentRef.instance as { data: any }).data = {
            count: this.count,
            module: this.data.module || "",
            channel: this.data.channel,
            openEditor: this.data.openEditor,
            subType: this.data.subType,
            viewContainerRef,
        };
    }

    /**
     * create Textarea
     *
     * @memberof QaTextComponent
     */
    createTextarea() {
        const elem = this.body.nativeElement;
        const childCount = elem.childElementCount;
        this.count = !!~this.data.channel.indexOf("google") ? childCount : childCount + 1;

        // add textarea
        if (this.count <= TEXT.TEXTAREA_MAX) this.loadComponent(TextareaComponent);

        // hide add icon when limitation of textarea
        if (this.count === TEXT.TEXTAREA_MAX) {
            const textBlock = elem.parentElement;
            textBlock.querySelector(".icon-add-btn").style.display = "none";
        }

        if (this.count === TEXT.TEXTAREA_MAX) this.isMaxCount = true;
        else this.isMaxCount = false;

        if (this.count === TEXT.TEXTAREA_MIN) {
            const iconTrashElem = elem.firstChild.querySelector(".icon-trash");
            iconTrashElem.style.visibility = "visible";
        }
    }

    /**
     * trash Icon Status
     *
     * @private
     * @param {*} visibilityStatus
     * @memberof QaTextComponent
     */
    private trashIconStatus(visibilityStatus) {
        setTimeout(() => {
            const iconTrashElem = this.body.nativeElement.firstChild.querySelector(".icon-trash");
            iconTrashElem.style.visibility = visibilityStatus;
        }, SET_TIMEOUT.EXTREMELY);
    }

    /**
     * is Random
     *
     * @memberof QaTextComponent
     */
    isRandom() {
        const bodyElem = this.body.nativeElement;
        const viewLength = this.cbeSharedTextareaLoader.viewContainerRef.length;
        const textBlock = bodyElem.parentElement;

        if (!this.toggleChecked) {
            this.viewContainerRefArr = [];
            for (let i = 1; i < viewLength; i++) {
                this.cbeSharedTextareaLoader.viewContainerRef.remove();
            }
            this.trashIconStatus("hidden");

            textBlock.querySelector(".icon-add-btn").style.display = "none";
        } else {
            for (let i = 0; i < this.viewContainerRefArr.length; i++) {
                this.cbeSharedTextareaLoader.viewContainerRef.insert(this.viewContainerRefArr[i], i + 1);
            }

            if (this.cbeSharedTextareaLoader.viewContainerRef.length > 1) this.trashIconStatus("visible");

            this.isMaxCount = false;

            this.count = this.viewContainerRefArr.length + 1;
            if (this.count < TEXT.TEXTAREA_MAX) textBlock.querySelector(".icon-add-btn").style.display = "flex";
        }
    }

    /**
     * append To Component
     *
     * @memberof QaTextComponent
     */
    appendToComponent() {
        const loadData = this.data.loadData;
        const elem = this.body?.nativeElement;
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        if (typeof loadData.text === "string") {
            const textStr = loadData.text;
            loadData.text = [];
            loadData.text.push(textStr);
        }

        if (!!elem) {
            elem.firstChild.querySelector("textarea").innerHTML = loadData.text[0];
            if (loadData.text.length > 1) {
                this.toggleChecked = true;

                for (let i = 1; i < loadData.text.length; i++) {
                    this.createTextarea();
                    elem.querySelectorAll("textarea")[i].innerHTML = loadData.text[i];
                }
            }

            if (!!elem.querySelector("input")) elem.querySelector("input").value = loadData.textToSpeech || "";
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
        this.changeDetectorRef.detectChanges();

        this.setResultState();
    }

    /**
     * set Result State
     *
     * @memberof QaTextComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        this.textareaArr = [];
        let result = {};

        if (!!this.body) {
            let isTextExist = false;
            for (const i of this.body.nativeElement.children) {
                if (!!i.querySelector("textarea")) {
                    const val = i.querySelector("textarea").value;
                    isTextExist = isTextExist || !!val;
                    this.textareaArr.push(val);
                }
            }

            const id = this.data.id;
            const channel = this.data.channel;
            const resultObj: IAnsTextJson = {
                channelId: this.channelId,
                channel,
                type: "Text",
                text: this.textareaArr.length === 0 ? [""] : this.textareaArr,
                textToSpeech: !!this.text ? this.text.nativeElement["value"] || "" : "",
                version: "v770",
            };

            if (!~channel.indexOf("google")) delete resultObj.textToSpeech;

            result = Object.assign(this.qaTextObj.result || {}, { [id]: resultObj }, {});
        }

        if (!!Object.keys(result).length) {
            this.qaTextService.setState({
                data: { result },
            });
        }
    }

    ngOnInit(): void {
        this.isOninit = true;

        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.count = 1;
        this.loadComponent(TextareaComponent);

        this.QaTextState = this.qaTextService.qaTextState$.subscribe((resp) => {
            this.qaTextObj = resp.data;
        });

        this.SubIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp === true) {
                if (this.body.nativeElement.querySelectorAll("textarea").length === 1) this.toggleChecked = false;
                if (!!~this.data.channel.indexOf("google")) this.verifyForm();
            }
        });

        this.SubIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
            if (resp && !this.isOninit) this.verifyForm();
        });

        // Processing data from load api
        if (!!this.data.loadData) {
            this.isLoad = true;
        }

        this.isOninit = false;
    }

    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.QaTextState) this.QaTextState.unsubscribe();
        if (!!this.SubIsSave) this.SubIsSave.unsubscribe();
        if (!!this.SubIsNeedVerify) this.SubIsNeedVerify.unsubscribe();
    }

    ngAfterViewInit() {
        if (!!~this.data.channel.indexOf("google") && this.data.subType === "option") {
            this.isOperatorHide = true;
            this.isShowRandom = "none";
            this.googleDefField = true;

            const elem = this.body?.nativeElement;
            if (!!elem) {
                elem.firstChild.querySelector("textarea").innerHTML = this.QA_EDITOR.TEXT.GOOGLE_DEFAULT_TEXT;

                if (!!elem.querySelector("input"))
                    elem.querySelector("input").value = this.QA_EDITOR.TEXT.GOOGLE_DEFAULT_TEXT;
            }
        }
    }

    ngOnChanges() {
        this.appendToComponent();
    }
}
