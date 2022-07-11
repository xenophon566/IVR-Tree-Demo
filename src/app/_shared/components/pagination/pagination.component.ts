import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { LanguageService } from "@core/utils";

/**
 *
 * @example
 * #  <cbe-pagination
 * #    [data]="paginationData"
 * #    (changePageIndex)="onChagePage($event)">
 * #  </cbe-pagination>
 * #
 * #
 * #    paginationData 格式
 * #    {
 * #     pageSize: number - 每頁筆數,
 * #     currentPageIndex: number - 當前頁數,
 * #     recordCount: number - 總筆數,
 * #     pageCount: number - 總頁數,
 * #    }
 * #
 *
 * @export
 * @class InputSearchComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-pagination",
    templateUrl: "./pagination.component.html",
    styleUrls: ["./pagination.component.scss"],
})
export class PaginationComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(private languageService: LanguageService) {
        this.languageService.language$.subscribe(() => {
            this.PAGINATION = this.languageService.getLanguages("COMPONENTS");
        });
    }
    ngOnInit(): void {}

    /**
     * i18n
     *
     * @type {*}
     * @property {any} PAGINATION
     * @memberof PaginationComponent
     */
    PAGINATION: any;

    /**
     * 接收父元件傳遞的資料
     *
     * @memberof PaginationComponent
     */
    @Input()
    get data(): any {
        return this.paginationData;
    }

    set data(dataInfo: any) {
        this.setData(JSON.parse(JSON.stringify(dataInfo)));
        this.paginationData = JSON.parse(JSON.stringify(dataInfo));
    }

    /**
     * 分頁器資料來源
     *
     * @memberof PaginationComponent
     */
    paginationData: any;

    /**
     * 頁碼輸入框元素
     *
     * @type {ElementRef<HTMLElement>}
     * @memberof PaginationComponent
     */
    @ViewChild("pageInput") pageInput: ElementRef<HTMLElement>;

    /**
     * 處理資料
     *
     * @param {*} dataInfo
     * @memberof PaginationComponent
     */
    setData(dataInfo) {
        if (!!dataInfo && Object.keys(dataInfo).length > 0) {
            if (dataInfo?.pageCount === 0 || dataInfo?.recordCount === 0) this.displayStart = this.displayEnd = 0;
            else this.displayStart = (dataInfo.currentPageIndex - 1) * dataInfo.pageSize + 1;
            this.displayEnd =
                dataInfo.currentPageIndex * dataInfo.pageSize > dataInfo.recordCount
                    ? dataInfo.recordCount
                    : dataInfo.currentPageIndex * dataInfo.pageSize;
            this.currentPageIndex = dataInfo.currentPageIndex;
            this.recordCount = dataInfo.recordCount;
            this.pageCount = dataInfo.pageCount;
            this.hasNextPage = dataInfo.pageCount > dataInfo.currentPageIndex ? true : false;
        }
    }

    /**
     * 是否有下一頁
     *
     * @type {boolean}
     * @memberof PaginationComponent
     */
    public hasNextPage: boolean = false;

    /**
     * 當前起始筆數
     *
     * @type {number}
     * @memberof PaginationComponent
     */
    public displayStart: number = 0;

    /**
     * 當前最後筆數
     *
     * @type {number}
     * @memberof PaginationComponent
     */
    public displayEnd: number = 0;

    /**
     * 當前頁數
     *
     * @type {number}
     * @memberof PaginationComponent
     */
    public currentPageIndex: number = 0;

    /**
     * 總頁數
     *
     * @type {number}
     * @memberof PaginationComponent
     */
    public pageCount: number = 0;

    /**
     * 總筆數
     *
     * @type {number}
     * @memberof PaginationComponent
     */
    public recordCount: number = 0;

    /**
     * 頁碼輸入值
     *
     * @type {*}
     * @memberof PaginationComponent
     */
    public inputText: any;

    /**
     * changePageIndex EventEmitter
     *
     * @memberof PaginationComponent
     */
    @Output() changePageIndex = new EventEmitter<any>();

    /**
     * 切換分頁
     *
     * @param {*} rowData
     * @memberof PaginationComponent
     */
    doChangePage(pageIndex) {
        if (pageIndex) this.changePageIndex.emit(pageIndex);
        else {
            this.inputText = Number((this.pageInput.nativeElement as HTMLInputElement).value);
            if (this.inputText && this.inputText <= this.paginationData.pageCount)
                this.changePageIndex.emit(this.inputText);
        }
    }
}
