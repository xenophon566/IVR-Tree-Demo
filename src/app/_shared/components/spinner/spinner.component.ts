import { Component, OnInit } from "@angular/core";

/**
 * ## Spinners 載入中元件
 * ```
 * 使用 Bootstrap 微調器指示組件或頁面的加載狀態，完全使用 HTML、CSS 和無 JavaScript 構建。
 * ```
 *
 * @export
 * @class SpinnerComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-spinner",
    templateUrl: "./spinner.component.html",
    styleUrls: ["./spinner.component.scss"],
})
export class SpinnerComponent implements OnInit {
    /**
     * @ignore
     */
    constructor() {}

    /**
     * @ignore
     */
    ngOnInit(): void {}
}
