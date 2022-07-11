import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

/**
 * reply-content service
 *
 * @export
 * @class ReplyContentService
 */
@Injectable({
    providedIn: "root",
})
export class ReplyContentService {
    constructor() {}

    /**
     * RxJS reply-content state
     *
     * @memberof ReplyContentService
     */
    public replyContentState = new BehaviorSubject<any>({});
    replyContentState$ = this.replyContentState.asObservable();

    /**
     * for clear reply-content
     *
     * @memberof ReplyContentService
     */
    public isClearReplyAry = new BehaviorSubject<any>(false);
    isClearReplyAry$ = this.isClearReplyAry.asObservable();

    /**
     * set reply-content state
     *
     * @param {*} value
     * @memberof ReplyContentService
     */
    setState(value: any): void {
        this.replyContentState.next(value);
    }

    /**
     * clear reply content service
     *
     * @memberof ReplyContentService
     */
    clearReplyContentService(): void {
        this.replyContentState.next({});
    }

    /**
     * Load Single Component (Qa-Json / Qa-Link) will use this method to clear reply.
     *
     * @param {boolean} value
     * @memberof ReplyContentService
     */
    setIsClearReplyAry(value: boolean): void {
        this.isClearReplyAry.next(value);
    }
}
