import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-text service
 *
 * @export
 * @class QaTextService
 */
@Injectable({
    providedIn: "root",
})
export class QaTextService {
    constructor() {}

    /**
     * RxJS text state
     *
     * @memberof QaTextService
     */
    public qaTextState = new Subject<any>();
    qaTextState$ = this.qaTextState.asObservable();

    /**
     * set text state
     *
     * @param {*} value
     * @memberof QaTextService
     */
    setState(value: any): void {
        this.qaTextState.next(value);
    }
}
