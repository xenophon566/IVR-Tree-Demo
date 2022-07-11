import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Greeting Editor Service
 *
 * @export
 * @class GreetingEditorService
 */
@Injectable({
    providedIn: "root",
})
export class GreetingEditorService {
    constructor() {}

    /**
     * reply QAData BehaviorSubject
     *
     * @memberof GreetingEditorService
     */
    public replyQAData = new BehaviorSubject<any>([]);
    replyQAData$ = this.replyQAData.asObservable();

    /**
     * set Reply QAData
     *
     * @param {*} value
     * @param {*} id
     * @memberof GreetingEditorService
     */
    setReplyQAData(value, id) {
        this.replyQAData.next([value, id]);
    }

    /**
     * clear Reply QAData
     *
     * @memberof GreetingEditorService
     */
    clearReplyQAData() {
        this.replyQAData.next([]);
    }
}
