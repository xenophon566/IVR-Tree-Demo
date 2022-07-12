import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";

/**
 * Basic Table Component
 *
 * @export
 * @class BasicTableComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-basic-table",
    templateUrl: "./basic-table.component.html",
    styleUrls: ["./basic-table.component.scss"],
})
export class BasicTableComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>) {}

    /**
     * dataSource
     *
     * @type {NbTreeGridDataSource<any>}
     * @memberof BasicTableComponent
     */
    dataSource: NbTreeGridDataSource<any>;

    /**
     * customColumn
     *
     * @memberof BasicTableComponent
     */
    customColumn = "";

    /**
     * defaultColumns
     *
     * @memberof BasicTableComponent
     */
    defaultColumns = [];

    /**
     * allColumns
     *
     * @memberof BasicTableComponent
     */
    allColumns = [];

    /**
     * customTitleColumn
     *
     * @memberof BasicTableComponent
     */
    customTitleColumn = "";

    /**
     * defaultTitleColumns
     *
     * @memberof BasicTableComponent
     */
    defaultTitleColumns = [];

    /**
     * allTitleColumns
     *
     * @memberof BasicTableComponent
     */
    allTitleColumns = [];

    tableData: any;

    @Input()
    get data(): string {
        return this.tableData;
    }

    set data(info: string) {
        this.tableData = info;
        this.setTable();
    }

    /**
     * editRowData EventEmitter
     *
     * @memberof BasicTableComponent
     */
    @Output() editRowData = new EventEmitter<any>();

    @Output() operatorEditRowData = new EventEmitter<any>();

    @Output() operatorDeleteRowData = new EventEmitter<any>();

    enableIcon = '<nb-icon icon="checkmark-outline"></nb-icon>';

    /**
     * onEdit
     *
     * @param {*} rowData
     * @memberof BasicTableComponent
     */
    onEdit(rowData) {
        this.editRowData.emit(rowData);
    }

    operatorEdit(rowData) {
        this.operatorEditRowData.emit(rowData);
    }

    operatorDelete(rowData) {
        this.operatorDeleteRowData.emit(rowData);
    }

    ngOnInit(): void {
        this.setTable();
    }

    setTable() {
        const tableData = this.tableData;
        const column = tableData.column;
        const columnTitle = tableData.columnTitle;
        const rowData = tableData.rowData;

        this.customColumn = column[0];
        this.defaultColumns = column.slice(1, column.length);
        this.allColumns = [this.customColumn, ...this.defaultColumns];

        this.customTitleColumn = columnTitle[0];
        this.defaultTitleColumns = columnTitle.slice(1, columnTitle.length);
        this.allTitleColumns = [this.customTitleColumn, ...this.defaultTitleColumns];

        this.dataSource = this.dataSourceBuilder.create(rowData);
    }
}
