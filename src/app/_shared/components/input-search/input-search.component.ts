import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from "@angular/core";

/**
 *
 * @example
 * # <cbe-input-search style="width: 100%"
 * #     (searchText)="onUpdate($event)"
 * #     [placeHolder]="placeHolderWording">
 * # </cbe-input-search>
 *
 * @export
 * @class InputSearchComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-input-search",
    templateUrl: "./input-search.component.html",
    styleUrls: ["./input-search.component.scss"],
})
export class InputSearchComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    @ViewChild("searchInput") searchInput: ElementRef<HTMLElement>;
    public inputText: string;

    /**
     * 接受父層要在輸入框內顯示的 placeHolder 文字
     *
     * @memberof InputSearchComponent
     */
    @Input() placeHolder: string;

    /**
     * searchText EventEmitter
     *
     * @memberof InputSearchComponent
     */
    @Output() searchText = new EventEmitter<any>();

    /**
     * 輸入框文字送往父層
     *
     * @memberof InputSearchComponent
     */
    onSearch() {
        this.inputText = (this.searchInput.nativeElement as HTMLInputElement).value;
        this.searchText.emit(this.inputText);
    }

    /**
     * 清除輸入框並發送空字串給父層
     *
     * @memberof InputSearchComponent
     */
    onClear() {
        if (this.searchInput) {
            this.inputText = (this.searchInput.nativeElement as HTMLInputElement).value = "";
            this.searchText.emit(this.inputText);
        }
    }
}
