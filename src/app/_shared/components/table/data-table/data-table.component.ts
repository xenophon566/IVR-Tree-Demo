import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { TenantService, UserService } from "@core/state";
import { UtilitiesService } from "@core/utils";
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";
import { ConsoleService } from "@ng-select/ng-select/lib/console.service";

/**
 *
 * @example
 * # <cbe-data-table [tableColumn]="tableColumn" [tableOption]="tableOption">
 * # </cbe-data-table>
 *
 * @export
 * @class DataTableComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-data-table",
    templateUrl: "./data-table.component.html",
    styleUrls: ["./data-table.component.scss"],
})
export class DataTableComponent implements OnInit, OnChanges {
    /**
     * @ignore
     */
    constructor(private utilitiesService: UtilitiesService, private httpService: HttpService) {}

    serverSide: boolean = false;

    ngOnInit(): void {}

    ngOnChanges(data): void {
        const changesKey = Object.keys(data) || [];

        if (!!~changesKey.indexOf("tableColumn")) {
            this.tableData.column = data.tableColumn.currentValue.column;
            this.tableData.columnTitle = data.tableColumn.currentValue.columnTitle;
            this.originRowData = this.tableData.rowData = !!data.tableColumn.currentValue.rowData
                ? data.tableColumn.currentValue.rowData
                : this.tableData.rowData;
            this.tableData = JSON.parse(JSON.stringify(this.tableData));
            this.getData();
        }

        if (!!~changesKey.indexOf("tableOption")) {
            this.serverSide = !!data.tableOption.currentValue.serverSide ? true : false;
            if (!!this.serverSide) this.originBody = JSON.parse(JSON.stringify(data.tableOption.currentValue.body));
            this.getData();
        }
    }

    /**
     * 取得資料並處理格式
     *
     * @param body API 的 body 內容
     * @memberof UserListComponent
     */
    async getData() {
        if (this.serverSide) {
            let httpResult: any;
            if (!this.utilitiesService.getMockSession())
                httpResult = await this.httpService.httpPOST(this.tableOption.apiUrl, this.tableOption.body);
            else httpResult = await this.httpService.httpGET(this.tableOption.apiMockUrl);

            if (httpResult?._header_?.success) {
                this.paginationData = {
                    pageSize: this.tableOption.body.pageSize,
                    currentPageIndex: this.tableOption.body.pageIndex,
                    recordCount: httpResult.recordCount || httpResult.totalSize,
                    pageCount: httpResult.pageCount,
                };
                const rowData = [];
                httpResult.items.forEach((data) => {
                    rowData.push({ data });
                });
                this.tableData.rowData = rowData;
                this.tableData = JSON.parse(JSON.stringify(this.tableData));
            }
        } else {
            let recordCount = this.originRowData.length;
            let pageCount = Math.ceil(this.originRowData.length / this.tableOption.body.pageSize);
            const pageSize = this.tableOption.body.pageSize;
            const currentPageIndex = this.tableOption.body.pageIndex;
            const spliceRowData = [];

            if (recordCount > 0) {
                let spliceData = [];

                if (!!this.searchText) {
                    const filterRowData = this.originRowData.filter(
                        (data) => !!~data[this.tableOption.searchText.searchField].indexOf(this.searchText)
                    );

                    recordCount = filterRowData.length;
                    pageCount = Math.ceil(filterRowData.length / this.tableOption.body.pageSize);

                    filterRowData.forEach((data, idx) => {
                        spliceData.push(JSON.parse(JSON.stringify({ data })));
                        if (idx % pageSize === pageSize - 1 || idx === filterRowData.length - 1) {
                            spliceRowData.push(spliceData);
                            spliceData = [];
                        }
                    });
                } else {
                    this.originRowData.forEach((data, idx) => {
                        spliceData.push(JSON.parse(JSON.stringify({ data })));
                        if (idx % pageSize === pageSize - 1 || idx === this.originRowData.length - 1) {
                            spliceRowData.push(spliceData);
                            spliceData = [];
                        }
                    });
                }
            }

            this.tableData.rowData = spliceRowData[currentPageIndex - 1];
            this.tableData = JSON.parse(JSON.stringify(this.tableData));
            this.paginationData = {
                pageSize,
                currentPageIndex,
                recordCount,
                pageCount,
            };
        }
    }

    /**
     * 存放 client-side 原始 rowData 資料
     *
     * @type {*}
     * @memberof DataTableComponent
     */
    originRowData: any;

    /**
     * 表格內容效果 (link / valueMix)
     *
     * @memberof DataTableComponent
     */
    @Input() tableOption;

    /**
     * 表格欄位資料
     *
     * @readonly
     * @type {*}
     * @memberof DataTableComponent
     */
    @Input() tableColumn;

    tableData: any = {
        column: [],
        columnTitle: [],
        rowData: [],
    };

    /**
     * 原始 Api Body
     *
     * @type {*}
     * @memberof DataTableComponent
     */
    originBody: any;

    /**
     * 接收到頁數切換
     *
     * @param {*} $event
     * @memberof DataTableComponent
     */
    onChagePage($event) {
        if (!!$event) {
            this.tableOption.body.pageIndex = $event;

            if (!!this.searchText) this.tableOption.body.keyword = this.searchText;
            else delete this.tableOption.body.keyword;

            this.getData();
        }
    }

    /**
     * 搜尋框輸入的文字
     *
     * @type {string}
     * @memberof DataTableComponent
     */
    searchText: string = "";

    /**
     * 分頁器資料
     *
     * @type {*}
     * @memberof DataTableComponent
     */
    paginationData: any = {};

    /**
     * 接收到搜尋輸入框內容
     *
     * @param $event 輸入內容
     * @memberof EnterpriseListComponent
     */
    onUpdate($event) {
        this.searchText = $event;
        if ($event) {
            this.tableOption.body.pageIndex = 1;
            this.tableOption.body.keyword = $event.toString();
        } else {
            if (!!this.serverSide) this.tableOption.body = JSON.parse(JSON.stringify(this.originBody));
            this.tableOption.body.pageIndex = 1;
        }

        this.getData();
    }
}
