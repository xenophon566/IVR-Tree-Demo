import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatTable } from "@angular/material/table";

export interface PeriodicElement {
    position: number;
    name: string;
    weight: number;
    symbol: string;
}

@Component({
    selector: "cbe-drag-table",
    templateUrl: "./drag-table.component.html",
    styleUrls: ["./drag-table.component.scss"],
})
export class DragTableComponent implements OnInit {
    constructor() {}

    @ViewChild("table") table: MatTable<PeriodicElement>;

    @Input() data: any;

    displayedColumns: string[];

    displayedColumnsTitle: string[];

    dataSource: any[];

    dropTable(event: CdkDragDrop<PeriodicElement[]>) {
        const prevIndex = this.dataSource.findIndex((d) => d === event.item.data);
        moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
        for (const i in this.dataSource) this.dataSource[i].FUserOrderIndex = +i + 1;
        this.table.renderRows();
    }

    ngOnInit(): void {
        this.displayedColumns = this.data.column;
        this.displayedColumnsTitle = this.data.columnTitle;
        this.dataSource = this.data.rowData;
    }
}
