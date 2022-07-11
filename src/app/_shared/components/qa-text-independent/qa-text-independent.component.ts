import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { QaTextIndependentService } from "@core/state";
import { LanguageService } from "@core/utils";

@Component({
    selector: "cbe-qa-text-independent",
    templateUrl: "./qa-text-independent.component.html",
    styleUrls: ["./qa-text-independent.component.scss"],
})
export class QaTextIndependentComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private qaTextIndependentService: QaTextIndependentService,
        private changeDetectorRef: ChangeDetectorRef,
        private languageService: LanguageService
    ) {
        this.languageService.language$.subscribe((resp) => {
            this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        });
    }

    @ViewChild("body") body: ElementRef;

    @Input() data: any;

    /**
     * 隨機最大數量
     *
     * @type {number}
     * @memberof QaTextIndependentComponent
     */
    MAX_LENGTH: number = 6;

    QA_EDITOR: any;

    /**
     * 元件畫面產生的資料
     *
     * @memberof QaTextIndependentComponent
     */
    loadData = [""];

    /**
     * 隨機參數
     *
     * @type {boolean}
     * @memberof QaTextIndependentComponent
     */
    toggleChecked: boolean = false;

    /**
     * 是否顯示刪除按鈕
     *
     * @memberof QaTextIndependentComponent
     */
    canDelete = false;

    /**
     * 是否顯示新增按鈕
     *
     * @memberof QaTextIndependentComponent
     */
    canAdd = false;

    /**
     * 標題
     *
     * @type {string}
     * @memberof QaTextIndependentComponent
     */
    title: string = "";

    subDoVerify: any;

    qaTextObj: any = {};

    textareaArr = [];

    placeholder: string = "";

    id = "";

    ngOnInit() {
        this.subDoVerify = this.qaTextIndependentService.qaTextDoVerify$.subscribe((resp) => {
            if (resp) {
                this.checkError();
                this.doVerify();
            }
        });

        this.setData();
    }

    ngAfterViewChecked() {
        this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.subDoVerify) this.subDoVerify.unsubscribe();
    }

    ngOnChanges() {
        this.cleanStatus();
        this.setData();
    }

    /**
     * 透過 data 來源設定資料
     *
     * @memberof QaTextIndependentComponent
     */
    setData() {
        if (!!this.data) {
            this.changeDetectorRef.detach();
            if (!!this.data.loadData) this.loadData = this.data.loadData.text || [""];
            this.id = this.data.id || Math.random().toString(36).substring(7);
            this.title = this.data.title || "文字";
            this.placeholder = this.data.placeholder || "";
            if (!!this.loadData && this.loadData.length > 1) {
                this.toggleChecked = true;
                if (this.loadData.length < 6) {
                    this.canAdd = true;
                    this.canDelete = true;
                } else {
                    this.canDelete = false;
                    this.canAdd = false;
                }
            }
            this.changeDetectorRef.reattach();
        }
    }

    /**
     * 清除所有狀態
     *
     * @memberof QaTextIndependentComponent
     */
    cleanStatus() {
        this.changeDetectorRef.detach();
        this.textareaArr = [];
        this.loadData = [""];
        this.id = "";
        this.canAdd = false;
        this.toggleChecked = false;
        this.canDelete = false;
        if (!!this.body)
            for (const item of this.body.nativeElement.querySelectorAll(".text-area")) {
                if (item.style.borderColor === "red") {
                    item.style.borderColor = "";
                    item.nextElementSibling.textContent = "";
                }
            }
        this.changeDetectorRef.reattach();
    }

    /**
     * textarea OnBlur 事件
     *
     * @param {*} $event
     * @memberof QaTextIndependentComponent
     */
    textareaOnBlur($event) {
        // console.log('event:', $event);
        if (!!$event.target.value && !!$event.target.value.trim()) {
            if ($event.target.value.length > 2000) {
                $event.target.style.borderColor = "red";
                $event.target.nextElementSibling.textContent = this.QA_EDITOR.TEXT.FIELD_LENGTH_LIMIT;
            } else {
                $event.target.style.borderColor = "";
                $event.target.nextElementSibling.textContent = "";
            }
        } else {
            $event.target.style.borderColor = "red";
            $event.target.nextElementSibling.textContent = this.QA_EDITOR.TEXT.FIELD_REQUIRED;
        }

        this.doVerify();
    }

    /**
     * 檢查欄位限制
     *
     * @param {*} [target=null]
     * @memberof QaTextIndependentComponent
     */
    checkError(target = null) {
        if (target) {
            if (!!target.value && !!target.value.trim()) {
                if (target.value.length > 2000) {
                    target.style.borderColor = "red";
                    target.nextElementSibling.textContent = this.QA_EDITOR.TEXT.FIELD_LENGTH_LIMIT;
                } else {
                    target.style.borderColor = "";
                    target.nextElementSibling.textContent = "";
                }
            } else {
                target.style.borderColor = "red";
                target.nextElementSibling.textContent = this.QA_EDITOR.TEXT.FIELD_REQUIRED;
            }
        } else {
            if (!!this.body && !!this.body.nativeElement.querySelectorAll(".text-area")) {
                for (const item of this.body.nativeElement.querySelectorAll(".text-area")) {
                    if (!!item.value && !!item.value.trim()) {
                        if (item.value.length > 2000) {
                            item.style.borderColor = "red";
                            item.nextElementSibling.textContent = this.QA_EDITOR.TEXT.FIELD_LENGTH_LIMIT;
                        } else {
                            item.style.borderColor = "";
                            item.nextElementSibling.textContent = "";
                        }
                    } else {
                        item.style.borderColor = "red";
                        item.nextElementSibling.textContent = this.QA_EDITOR.TEXT.FIELD_REQUIRED;
                    }
                }
            }
        }
    }

    /**
     * 驗整 qa-text 是否通過
     *
     * @memberof QaTextIndependentComponent
     */
    doVerify() {
        let status = true;
        for (const item of this.body.nativeElement.querySelectorAll(".text-area")) {
            if (item.style.borderColor === "red") status = false;
        }

        if (status) this.qaTextIndependentService.setVerify(true);
        else this.qaTextIndependentService.setVerify(false);
    }

    /**
     * 隨機
     *
     * @memberof QaTextComponent
     */
    isRandom() {
        if (this.toggleChecked === false) {
            this.loadData.splice(1);
            this.canDelete = false;
        } else this.canAdd = true;
        this.doVerify();
    }

    /**
     * set Result State
     *
     * @memberof QaTextComponent
     */
    setResultState() {
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
            const resultObj = {
                type: "Text",
                text: this.textareaArr.length === 0 ? [""] : this.textareaArr,
                version: "v770",
            };

            result = Object.assign(this.qaTextObj.result || {}, { [id]: resultObj }, {});
        }

        if (!!Object.keys(result).length) {
            this.qaTextIndependentService.setState({
                data: { result },
            });
        }
    }

    /**
     * 新增 textarea
     *
     * @param {string} [value='']
     * @memberof QaTextIndependentComponent
     */
    createTextarea(value = "") {
        if (this.body.nativeElement.children.length < this.MAX_LENGTH) {
            this.loadData.push(value);
            this.canDelete = true;
        }
        if (this.body.nativeElement.children.length === this.MAX_LENGTH - 1) this.canAdd = false;

        this.doVerify();
    }

    /**
     * 刪除 textarea
     *
     * @param {*} $event
     * @memberof QaTextIndependentComponent
     */
    deleteTextarea($event) {
        if (!!this.body && this.body.nativeElement.querySelectorAll(".text-area").length > 1) {
            for (let i = 0; i < this.body.nativeElement.querySelectorAll(".text-area").length; i++) {
                if (
                    this.body.nativeElement.querySelectorAll(".text-area")[i] ===
                    $event.currentTarget.nextElementSibling
                ) {
                    this.changeDetectorRef.detach();
                    this.body.nativeElement.querySelectorAll(".text-area")[i].style.borderColor = "";
                    this.body.nativeElement.querySelectorAll(".text-area")[i].nextElementSibling.textContent = "";
                    this.loadData.splice(i, 1);
                    this.changeDetectorRef.reattach();
                    setTimeout(() => {
                        this.checkError();
                    });
                }
            }
            if (this.body.nativeElement.querySelectorAll(".text-area").length < 7) {
                this.canAdd = true;
                if (this.body.nativeElement.querySelectorAll(".text-area").length === 2) {
                    this.canDelete = false;
                    this.canAdd = false;
                    this.toggleChecked = false;
                }
            }
        }
        this.doVerify();
    }

    /**
     * 解決 ngModel 造成每輸入字導致失焦問題
     *
     * @param {*} index
     * @param {*} item
     * @return {*}
     * @memberof QaTextIndependentComponent
     */
    trackByFn(index: any, item: any) {
        return index;
    }
}
