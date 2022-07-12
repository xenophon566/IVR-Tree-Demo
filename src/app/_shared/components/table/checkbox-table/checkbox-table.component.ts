import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbSortDirection, NbSortRequest } from "@nebular/theme";

/**
 * Checkbox Table Component
 *
 * @export
 * @class CheckboxTableComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-checkbox-table",
    templateUrl: "./checkbox-table.component.html",
    styleUrls: ["./checkbox-table.component.scss"],
})
export class CheckboxTableComponent implements OnInit {
    /**
     * Creates an instance of CheckboxTableComponent.
     *
     * @param {NbTreeGridDataSourceBuilder<any>} dataSourceBuilder
     * @memberof CheckboxTableComponent
     */
    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>) {}

    /**
     * selectedRowData EventEmitter
     *
     * @memberof CheckboxTableComponent
     */
    @Output() selectedRowData = new EventEmitter<any>();

    /**
     * selectedRowData EventEmitter
     *
     * @memberof CheckboxTableComponent
     */
    @Output() clickedRowData = new EventEmitter<any>();

    /**
     * 已勾選的資料
     *
     * @memberof CheckboxTableComponent
     */
    selectedList = [];

    /**
     * 接收父元件傳遞的資料
     *
     * @memberof CheckboxTableComponent
     */
    @Input()
    get data(): string {
        return this.tableData;
    }

    set data(info: string) {
        this.tableData = info;
        this.setTable();
    }

    /**
     * 接收父元件傳遞的資料
     *
     * @memberof CheckboxTableComponent
     */
    @Input()
    get selectedId(): any {
        return this.selectId;
    }

    set selectedId(info: any) {
        if (!!info) {
            switch (info.action) {
                case "onCreate":
                    this.selectId = "";
                    this.setTableBgColor("");
                    break;
                case "getList":
                case "clicked":
                    this.selectId = info.id;
                    this.setTableBgColor(info.id);
                    break;
                default:
                    break;
            }
        } else {
            this.selectId = "";
            this.setTableBgColor("");
        }
    }

    /**
     * 接收父元件傳遞的點擊 ID
     *
     * @memberof CheckboxTableComponent
     */
    selectId: any;

    /**
     * 表格資料來源
     *
     * @memberof CheckboxTableComponent
     */
    tableData: any;

    /**
     * 轉換成表格使用的資料格式
     *
     * @memberof CheckboxTableComponent
     */
    dataSource: NbTreeGridDataSource<any>;

    /**
     * 排序的欄位
     *
     * @memberof CheckboxTableComponent
     */
    sortColumn: string = "";

    /**
     * 排序的方式： asc / desc
     *
     * @memberof CheckboxTableComponent
     */
    sortDirection: NbSortDirection = NbSortDirection.NONE;

    ngOnInit(): void {}

    /**
     * 設定表格資料
     *
     * @memberof CheckboxTableComponent
     */
    setTable() {
        const tableData = this.tableData;
        const column = tableData.column;
        const columnTitle = tableData.columnTitle;
        const rowData = tableData.rowData;

        if (rowData.length > 0 && !~column.indexOf("isCheckbox")) {
            column.unshift("isCheckbox");
            columnTitle.unshift("");
            rowData.forEach((item) => {
                item.data.isCheckbox = false;
                item.data.bgColor = "white";
            });
        }
        this.selectedList = [];
        this.selectedRowData.emit(this.selectedList);
        const newRowData = JSON.parse(JSON.stringify(rowData));
        this.dataSource = this.dataSourceBuilder.create(newRowData);
    }

    /**
     * 選取勾選框監聽事件
     *
     * @param {*} $event
     * @param {*} row
     * @memberof CheckboxTableComponent
     */
    selectCheckbox($event, row) {
        if ($event) this.selectedList.push(row.data);
        else {
            let sameRowIndex;
            this.selectedList.forEach((item, idx) => {
                if (item.FId === row.data.FId) sameRowIndex = idx;
            });

            this.selectedList.splice(sameRowIndex, 1);
        }
        row.data.isCheckbox = !row.data.isCheckbox;
        this.tableData.rowData = this.tableData.rowData.map((item) => {
            if (item.data.FId === row.data.FId) return { data: row.data };
            else return item;
        });

        this.selectedRowData.emit(this.selectedList);
    }

    /**
     * 更換排序
     *
     * @param {*} rowData
     * @memberof CheckboxTableComponent
     */
    changeSort(sortRequest: NbSortRequest): void {
        if (this.dataSource) {
            this.dataSource.sort(sortRequest);
            this.sortColumn = sortRequest.column;
            this.sortDirection = sortRequest.direction;
        }
    }

    /**
     * 取得排序狀態
     *
     * @param {*} column
     * @memberof CheckboxTableComponent
     */
    getDirection(column: string): NbSortDirection {
        if (column === this.sortColumn) return this.sortDirection;
        return NbSortDirection.NONE;
    }

    /**
     * 設定表格資料
     *
     * @memberof CheckboxTableComponent
     */
    setTableBgColor(id) {
        const tableData = this.tableData;
        const rowData = tableData.rowData;

        if (rowData.length > 0) {
            rowData.forEach((item) => {
                if (item.data.bgColor !== "white") item.data.bgColor = "white";
                if (item.data.FId === id) item.data.bgColor = "#cce6fa";
                this.selectedList.forEach((row) => {
                    if (row.FId === item.data.FId) item.data.isCheckbox = true;
                });
            });
        }
        const newRowData = JSON.parse(JSON.stringify(rowData));
        this.dataSource = this.dataSourceBuilder.create(newRowData);
    }

    clickTd($event, row) {
        if ($event.target.parentElement.firstChild.type !== "checkbox") {
            this.clickedRowData.emit(row.data);
            this.setTableBgColor(row.data.FId);
        }
    }
}
