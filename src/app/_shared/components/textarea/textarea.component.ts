import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import { VerifyService, SET_TIMEOUT } from "@core/services";
import { QaEditorService } from "@core/state";
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
 * Textarea Component
 *
 * @export
 * @class TextareaComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: "cbe-shared-textarea",
    templateUrl: "./textarea.component.html",
    styleUrls: ["./textarea.component.scss"],
})
export class TextareaComponent implements OnInit, OnDestroy {
    /**
     * @ignore
     */
    constructor(
        private verifyService: VerifyService,
        private qaEditorService: QaEditorService,
        private languageService: LanguageService,
        private postMessageService: PostMessageService
    ) {
        this.languageService.language$.subscribe((resp) => {
            this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        });
    }

    @Input() data: any;

    /**
     * textarea HTMLElement
     *
     * @type {ElementRef<HTMLElement>}
     * @memberof TextareaComponent
     */
    @ViewChild("textarea") textarea: ElementRef<HTMLElement>;

    canDelete = false;

    isOninit: boolean = false;

    /**
     * verify State
     *
     * @type {*}
     * @memberof TextareaComponent
     */
    verifyState: any = {
        textarea: {
            state: true,
            errMsg: "",
        },
    };

    deleteId = "";

    textareaValue = "";

    SubIsSave: any;

    SubIsNeedVerify: any;

    SubIsRequiredTextByPhone: any;

    isRequiredTextByPhone: boolean = true;

    QA_EDITOR: any;

    id = Math.random().toString(36).substring(7);

    /**
     * verify array
     *
     * @memberof TextareaComponent
     */
    verifyAry = ["maxLength,2000", "isRequired"];

    inputDisabled = false;

    textareaMaxLength = 524288;

    /**
     * delete Textarea
     *
     * @param {*} $event
     * @memberof TextareaComponent
     */
    deleteTextarea($event) {
        console.log(this.textarea);

        if (!!this.textarea) {
            const textareaElem = this.textarea.nativeElement;
            const textBody = textareaElem.parentElement.parentElement.parentElement;
            const textBlock = textBody.parentElement;
            const textareaCount = textBody.childElementCount;

            if (textareaCount <= TEXT.TEXTAREA_MAX) {
                const iconAddBtn = textBlock.querySelector(".icon-add-btn");
                (iconAddBtn as HTMLElement).style.display = "block";
            }
        }

        const targetParent = $event.currentTarget.parentNode;
        const componentNode = targetParent.parentNode;
        const body = componentNode.parentNode;
        const bodyChildList = body.children;

        // remove textarea from viewContainerRef
        let elemIdx = 0;
        for (const i in bodyChildList) {
            if (typeof bodyChildList[i] === "object") {
                const className = bodyChildList[i].children[0].className;
                if (!!~className.indexOf(this.id)) elemIdx = +i;
            }
        }
        this.data.viewContainerRef.remove(elemIdx);

        // console.log(body);
        // body.parentElement.querySelector('.icon-add-btn').style.display = 'block';

        // hidden icon if only one textarea
        if (this.data.viewContainerRef.length === 1) {
            setTimeout(() => {
                body.firstChild.querySelector(".icon-trash").style.visibility = "hidden";
            }, SET_TIMEOUT.EXTREMELY);
        }

        if (this.SubIsSave) this.SubIsSave.unsubscribe();
        if (this.SubIsNeedVerify) this.SubIsNeedVerify.unsubscribe();
        this.deleteId = this.id;
    }

    /**
     * verify Form
     *
     * @memberof TextareaComponent
     */
    verifyForm() {
        // Against web channl in qa-editor doesn't check isRequired.
        if (this.data.openEditor === "smart-qa" && !!~this.data.channel.indexOf("web")) {
            this.qaEditorService.setIsRequiredVerifyState({
                textarea_isRequired: !!(this.textarea.nativeElement as HTMLInputElement).value.length,
                channel: this.data.channel,
            });
        }

        if (
            this.data.openEditor === "smart-qa" &&
            this.data.channel === "web" &&
            !this.qaEditorService.isRequiredVerify
        ) {
            if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
        } else if (!!~this.data.channel.indexOf("phone") && !this.isRequiredTextByPhone) {
            if (!!~this.verifyAry.indexOf("isRequired")) this.verifyAry.pop();
        } else if (!~this.verifyAry.indexOf("isRequired")) {
            this.verifyAry.push("isRequired");
        }

        // Max length limit for special channels
        if (!!~this.data.channel.indexOf("google")) this.verifyAry[0] = "maxLength,600";
        if (!!~this.data.channel.indexOf("instagram")) this.verifyAry[0] = "maxLength,1000";

        this.verifyState = {
            textarea: this.verifyService.verify(
                (this.textarea.nativeElement as HTMLInputElement).value,
                this.verifyAry
            ),
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

    ngOnInit(): void {
        this.isOninit = true;
        this.canDelete = this.data.count > 1 ? true : false;

        this.SubIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp === true) this.verifyForm();
        });

        this.SubIsNeedVerify = this.qaEditorService.isNeedVerify$.subscribe((resp: boolean) => {
            if (resp && !this.isOninit) this.verifyForm();
        });

        this.SubIsRequiredTextByPhone = this.qaEditorService.isRequiredTextByPhone$.subscribe((resp: boolean) => {
            if (!!~this.data.channel.indexOf("phone")) {
                this.inputDisabled = !resp;
                this.isRequiredTextByPhone = resp;
            }
        });

        this.isOninit = false;
    }

    ngAfterContentInit() {
        if (!!~this.data.channel.indexOf("google") && this.data.subType === "option") this.inputDisabled = true;
    }

    ngOnDestroy(): void {
        if (this.SubIsSave) this.SubIsSave.unsubscribe();
        if (this.SubIsNeedVerify) this.SubIsNeedVerify.unsubscribe();
        if (this.SubIsRequiredTextByPhone) this.SubIsRequiredTextByPhone.unsubscribe();
    }
}
