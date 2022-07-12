import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { TenantService, UserService } from "@core/state";
import { UtilitiesService } from "@core/utils";
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle } from "@angular/cdk/drag-drop";

/**
 *
 * @example
 * # <cbe-sort-table [data]="tableData"></cbe-sort-table>
 *
 * @export
 * @class InputSearchComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-sort-table",
    templateUrl: "./sort-table.component.html",
    styleUrls: ["./sort-table.component.scss"],
})
export class SortTableComponent implements OnInit, OnChanges {
    /**
     * @ignore
     */
    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>) {}

    ngOnInit(): void {}

    ngOnChanges(data): void {
        const changesKey = Object.keys(data) || [];

        if (!!~changesKey.indexOf("data")) {
            this.tableData = data.data.currentValue;
            this.setOption();
        }

        if (!!~changesKey.indexOf("option")) this.setOption();
    }

    /**
     * 接收父元件傳遞的資料
     *
     * @memberof SortTableComponent
     */
    @Input() data;

    /**
     * 資料連結處理
     *
     * @memberof SortTableComponent
     */
    setOption() {
        // link 超連結效果
        if (!!this.option?.link) this.optionLinkKey = Object.keys(this.option.link);

        if (!!this.option?.booleanConvert && !!this.tableData?.rowData) {
            this.option.booleanConvert.forEach((setting) => {
                this.tableData.rowData.forEach((items) => {
                    items.data[setting.newKey] = !!items.data[setting.convertKey]
                        ? setting.convertResult.true
                        : setting.convertResult.false;
                });
            });
        }

        if (!!this.option?.valueReplace && !!this.tableData?.rowData) {
            this.option.valueReplace.forEach((setting) => {
                this.tableData.rowData.forEach((items) => {
                    if (items.data.hasOwnProperty(setting.replaceKey)) {
                        items.data[setting.replaceKey] = items.data[setting.replaceKey].replaceAll(
                            setting.replacedString,
                            setting.coverString
                        );
                    }
                });
            });
        }

        if (!!this.option?.valueRelation && !!this.tableData?.rowData) {
            this.option.valueRelation.forEach((setting) => {
                this.tableData.rowData.forEach((items) => {
                    let userNames: any = "";
                    // 為了避免取得資料連Key都沒有之防呆
                    if (!!items.data[setting.relationKey]) {
                        for (let i = 0; i < items.data[setting.relationKey].length; i++) {
                            if (
                                items.data[setting.relationKey].length <= 1 ||
                                i === items.data[setting.relationKey].length - 1
                            )
                                userNames += items.data[setting.relationKey][i][setting.targetKey];
                            else
                                userNames +=
                                    items.data[setting.relationKey][i][setting.targetKey] + setting.connectionSymbol;
                        }
                    }
                    items.data[setting.newKey] = userNames;
                });
            });
        }

        if (!!this.option?.valueMix && !!this.tableData?.rowData) {
            this.option.valueMix.forEach((setting) => {
                this.tableData.rowData.forEach((data) => {
                    let newValue = data.data[setting.mixKey[0]];
                    for (let i = 1; i < setting.mixKey.length; i++) {
                        newValue += setting.mixWord + data.data[setting.mixKey[i]];
                    }
                    data.data[setting.columnKey] = newValue;
                });
            });
        }
        // online offline 效果
        if (!!this.option?.applicationStatus) {
            // 排序無法辨別 true 或 false 需改成字串
            this.applicationStatusKey = this.option.applicationStatus;
            if (this?.tableData?.rowData && this?.tableData?.rowData.length > 0)
                this?.tableData?.rowData.forEach((data) => {
                    this.applicationStatusKey.forEach((key) => {
                        data.data[key] = data?.data[key]?.toString();
                    });
                });
        }
        // 判斷成功替換值
        if (
            !!this.option?.changeValue &&
            this.option.changeValue.length > 0 &&
            this?.tableData?.rowData &&
            this?.tableData?.rowData.length > 0
        ) {
            this.option.changeValue.forEach((setting) => {
                switch (setting.conditions.operator) {
                    case "NotContain":
                        this.tableData.rowData.forEach((data) => {
                            if (
                                !!data.data[setting.conditions.fieldName] &&
                                !~data.data[setting.conditions.fieldName].indexOf(setting.conditions.value)
                            )
                                data.data[setting.changeKey] = setting.changeValue;
                        });
                        break;
                    case "Contain":
                        this.tableData.rowData.forEach((data) => {
                            if (
                                !!data.data[setting.conditions.fieldName] &&
                                !!~data.data[setting.conditions.fieldName].indexOf(setting.conditions.value)
                            )
                                data.data[setting.changeKey] = setting.changeValue;
                        });
                        break;
                    case "Equal":
                        this.tableData.rowData.forEach((data) => {
                            if (
                                !!data.data[setting.conditions.fieldName] &&
                                !!~data.data[setting.conditions.fieldName] === setting.conditions.value
                            )
                                data.data[setting.changeKey] = setting.changeValue;
                        });
                        break;
                    case "NotEqual":
                        this.tableData.rowData.forEach((data) => {
                            if (
                                !!data.data[setting.conditions.fieldName] &&
                                !!~data.data[setting.conditions.fieldName] !== setting.conditions.value
                            )
                                data.data[setting.changeKey] = setting.changeValue;
                        });
                        break;
                }
            });
        }

        this.tableData = JSON.parse(JSON.stringify(this.tableData));
        this.dataSource = this.dataSourceBuilder.create(this.tableData.rowData);
    }
    /**
     * 元件模組(需特殊處理之欄位)
     *
     * @type {*}
     * @memberof SortTableComponent
     */
    module: any = "";

    /**
     * 需特殊處理之欄位(Key)
     *
     * @type {*}
     * @memberof SortTableComponent
     */
    specificKey: any = [];

    /**
     * 特殊欄位處理後之值
     *
     * @type {*}
     * @memberof SortTableComponent
     */
    specificValue: any = "";

    /**
     * 存放使用 online offline 效果的欄位
     *
     * @type {*}
     * @memberof SortTableComponent
     */
    applicationStatusKey: any = [];

    /**
     * 欄位效果設定
     *
     * @readonly
     * @type {*}
     * @memberof SortTableComponent
     */
    @Input() option;

    /**
     * 使用連結的欄位
     *
     * @type {*}
     * @memberof SortTableComponent
     */
    optionLinkKey: any = [];

    /**
     * 表格資料來源
     *
     * @memberof SortTableComponent
     */
    tableData: any;

    /**
     * 轉換成表格使用的資料格式
     *
     * @memberof SortTableComponent
     */
    dataSource: NbTreeGridDataSource<any>;

    /**
     * 排序的欄位
     *
     * @memberof SortTableComponent
     */
    sortColumn: string = "";

    /**
     * 排序的方式： asc / desc
     *
     * @memberof SortTableComponent
     */
    sortDirection: NbSortDirection = NbSortDirection.NONE;

    /**
     * 更換排序
     *
     * @param {*} rowData
     * @memberof SortTableComponent
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
     * @memberof SortTableComponent
     */
    getDirection(column: string): NbSortDirection {
        if (column === this.sortColumn) return this.sortDirection;
        return NbSortDirection.NONE;
    }

    // dropTable(event: CdkDragDrop<any[]>) {
    //     const prevIndex = this.dataSource.findIndex((d) => d === event.item.data);
    //     moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
    //     this.table.renderRows();
    // }
}
