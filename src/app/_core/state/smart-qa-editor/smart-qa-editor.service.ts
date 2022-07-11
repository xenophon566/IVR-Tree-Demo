import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Smart QaEditor Service
 *
 * @export
 * @class SmartQaEditorService
 */
@Injectable({
    providedIn: "root",
})
export class SmartQaEditorService {
    constructor() {}

    /**
     * smart-qa-editor global object
     *
     * @type {object}
     * @memberof SmartQaEditorService
     */
    smartQaEditorObject: object = {
        unopenTabStack: [],
        fAnswerResult: {},
        fActivitySelected: {},
        triggerTab: "",
        toCloseChannelArr: [],
        activityList: [],
    };

    /**
     * RxJS replyQAData
     *
     * @memberof SmartQaEditorService
     */
    public replyQAData = new BehaviorSubject<any>([]);
    replyQAData$ = this.replyQAData.asObservable();

    /**
     * set Reply QAData
     *
     * @param {*} value
     * @param {*} id
     * @memberof SmartQaEditorService
     */
    setReplyQAData(value, id) {
        this.replyQAData.next([value, id]);
    }

    /**
     * clear Reply QAData
     *
     * @memberof SmartQaEditorService
     */
    clearReplyQAData() {
        this.replyQAData.next([]);
    }
}
