import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * MarketContent Editor Service
 *
 * @export
 * @class MarketContentEditorService
 */
@Injectable({
    providedIn: "root",
})
export class MarketContentEditorService {
    constructor() {}

    /**
     * reply QAData BehaviorSubject
     *
     * @memberof MarketContentEditorService
     */
    public replyQAData = new BehaviorSubject<any>([]);
    replyQAData$ = this.replyQAData.asObservable();

    /**
     * set Reply QAData
     *
     * @param {*} value
     * @param {*} id
     * @memberof MarketContentEditorService
     */
    setReplyQAData(value, id) {
        this.replyQAData.next([value, id]);
    }

    /**
     * clear Reply QAData
     *
     * @memberof MarketContentEditorService
     */
    clearReplyQAData() {
        this.replyQAData.next([]);
    }
}
