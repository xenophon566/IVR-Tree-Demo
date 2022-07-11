import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Greeting Editor Service
 *
 * @export
 * @class SatisfactionSurveyEditorService
 */
@Injectable({
    providedIn: "root",
})
export class SatisfactionSurveyEditorService {
    constructor() {}

    /**
     * reply QAData BehaviorSubject
     *
     * @memberof SatisfactionSurveyEditorService
     */
    public replyQAData = new BehaviorSubject<any>([]);
    replyQAData$ = this.replyQAData.asObservable();

    /**
     * set Reply QAData
     *
     * @param {*} value
     * @param {*} id
     * @memberof SatisfactionSurveyEditorService
     */
    setReplyQAData(value, id) {
        this.replyQAData.next([value, id]);
    }

    /**
     * clear Reply QAData
     *
     * @memberof SatisfactionSurveyEditorService
     */
    clearReplyQAData() {
        this.replyQAData.next([]);
    }
}
