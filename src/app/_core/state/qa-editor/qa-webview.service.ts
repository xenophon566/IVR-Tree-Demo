import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-webview service
 *
 * @export
 * @class QaWebviewService
 */
@Injectable({
    providedIn: "root",
})
export class QaWebviewService {
    constructor() {}

    /**
     * RxJS webview state
     *
     * @memberof QaWebviewService
     */
    public qaWebviewState = new Subject<any>();
    qaWebviewState$ = this.qaWebviewState.asObservable();

    /**
     * set webview state
     *
     * @param {*} value
     * @memberof QaWebviewService
     */
    setState(value: any): void {
        this.qaWebviewState.next(value);
    }
}
