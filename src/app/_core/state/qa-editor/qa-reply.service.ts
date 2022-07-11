import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

/**
 * qa-reply service
 *
 * @export
 * @class QaReplyService
 */
@Injectable({
    providedIn: "root",
})
export class QaReplyService {
    constructor() {}

    /**
     * RxJS reply state
     *
     * @memberof QaReplyService
     */
    public qaReplyState = new Subject<any>();
    qaReplyState$ = this.qaReplyState.asObservable();

    /**
     * set reply state
     *
     * @param {*} value
     * @memberof QaReplyService
     */
    setState(value: any): void {
        this.qaReplyState.next(value);
    }
}
