import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";

import { LanguageService, PostMessageService } from "@core/utils";
import { environment } from "@env/environment";
import { NbWindowService } from "@nebular/theme";

@Component({
    selector: "cbe-label-editor",
    templateUrl: "./label-editor.component.html",
    styleUrls: ["./label-editor.component.scss"],
})
export class LabelEditorComponent implements OnInit, OnChanges {
    /**
     * @ignore
     */
    constructor(
        private languageService: LanguageService,
        private postMessageService: PostMessageService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.languageService.language$.subscribe(() => {
            this.COMPONENTS = this.languageService.getLanguages("COMPONENTS");
            this.tableData.columnTitle = [
                this.COMPONENTS.LABELEDITOR.VARIABLE,
                this.COMPONENTS.LABELEDITOR.VARIABLE_VALUE,
                this.COMPONENTS.LABELEDITOR.VARIABLE_TYPE,
            ];
        });
    }

    /**
     * tableData 資料來源
     *
     * @memberof LabelEditorComponent
     */
    @Input() data;

    /**
     * 確認後傳遞編輯結果
     * {
     *    action: 'save' || ''cancel',
     *    data: [{
     *       key:'屬性',
     *       value:'參數',
     *       type:0,
     *    }]
     * }
     * @memberof LabelEditorComponent
     */
    @Output() editData = new EventEmitter<any>();

    /**
     * 是否按下確定按鈕
     *
     * @type {boolean}
     * @memberof LabelEditorComponent
     */
    isSaved: boolean = false;

    /**
     * i18n
     *
     * @type {*}
     * @memberof LabelEditorComponent
     */
    COMPONENTS: any;

    /**
     * 環境變數
     *
     * @memberof LabelEditorComponent
     */
    public environment = environment;

    /**
     * PostMessage 來源 ( greeting / qapro)
     *
     * @type {string}
     * @memberof LabelEditorComponent
     */
    public from: string = "";

    /**
     * 表格資料來源
     *
     * @memberof SortTableComponent
     */
    tableData: any = {
        columnTitle: [],
        column: ["key", "value", "type"],
        rowData: [],
    };

    /**
     * 區分編輯的區域
     * answer / question /card / quickReply
     *
     * @type {string}
     * @memberof LabelEditorComponent
     */
    mode: string = "";

    /**
     * 提供給答案編輯器使用的編輯頁籤
     *
     * @type {string}
     * @memberof LabelEditorComponent
     */

    tab: string = "";

    /**
     * reply-content 位置
     *
     * @type {*}
     * @memberof LabelEditorComponent
     */
    index: any = "";

    /**
     * 當前通路
     *
     * @type {*}
     * @memberof LabelEditorComponent
     */
    channel: any = "";

    /**
     * 當前元件 Id (card-content 使用)
     *
     * @type {*}
     * @memberof LabelEditorComponent
     */
    componentId: any = "";

    ngOnChanges(e): void {
        if (!!e?.data?.currentValue && Object.keys(e.data.currentValue).length > 0)
            this.tableData.rowData = e.data.currentValue;
    }

    ngOnInit(): void {
        this.onMessage();
    }

    /**
     * 新增按鈕
     *
     * @memberof LabelEditorComponent
     */
    addRow() {
        this.tableData.rowData.push({
            key: "",
            value: "",
            type: "0",
        });
    }

    /**
     * 刪除按鈕
     *
     * @param {*} deleteIndex
     * @memberof LabelEditorComponent
     */
    deleteRow(deleteIndex) {
        this.tableData.rowData.splice(deleteIndex, 1);
    }

    /**
     * 取消按鈕
     *
     * @memberof LabelEditorComponent
     */
    doCancel() {
        if (!!~environment.env.indexOf("stage")) {
            this.postMessageService.postMessage("custom", {
                type: "labelEditorCancel",
            });
        } else this.editData.emit({ type: "cancel" });
    }

    /**
     * 確認按鈕
     *
     * @memberof LabelEditorComponent
     */
    doSave() {
        this.isSaved = true;
        let canSave = true;
        if (this.tableData.rowData.length > 0) {
            this.tableData.rowData.forEach((row) => {
                if (row.key.trim().length === 0 || row.value.trim().length === 0) canSave = false;
            });
        }

        if (canSave) {
            if (!!~environment.env.indexOf("stage")) {
                this.postMessageService.postMessage("custom", {
                    type: "labelEditorSave",
                    data: this.tableData?.rowData?.length === 0 ? "" : this.tableData.rowData,
                    mode: this.mode,
                    tab: this.tab,
                    index: this.index,
                    channel: this.channel,
                    componentId: this.componentId,
                    from: this.from,
                });
            } else this.editData.emit({ type: "labelEditorSave", data: this.tableData.rowData });
        } else console.debug("欄位未填寫完整");
    }
    /**
     * iframe 監聽事件
     *
     * @private
     * @memberof LabelEditorComponent
     */
    private onMessage() {
        window.onmessage = (e) => {
            switch (e?.data?.type) {
                case "showLabelModal":
                    this.mode = e.data.mode || "";
                    this.tab = e.data.tab || "";
                    this.channel = e.data.channel || "";
                    this.index = e.data.index;
                    this.componentId = e.data.componentId || "";
                    this.from = e.data.from || "";
                    this.isSaved = false;
                    if (!!e.data.result && e.data.result.length > 0) {
                        this.tableData.rowData =
                            typeof e.data.result === "string" ? JSON.parse(e.data.result) : e.data.result;
                    } else this.tableData.rowData = [];
                    break;
            }
        };
    }
}
