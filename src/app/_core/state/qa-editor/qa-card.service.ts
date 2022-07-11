import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

/**
 * qa-card service
 *
 * @export
 * @class QaCardService
 */
@Injectable({
    providedIn: "root",
})
export class QaCardService {
    constructor() {}

    /**
     * card value object
     *
     * @type {object}
     * @memberof QaCardService
     */
    cardValObj: object = {
        web: {
            dot: [],
        },
        web_Activity: {
            dot: [],
        },
        messenger: {
            dot: [],
        },
        messenger_Activity: {
            dot: [],
        },
        line: {
            dot: [],
        },
        line_Activity: {
            dot: [],
        },
        android: {
            dot: [],
        },
        android_Activity: {
            dot: [],
        },
        ios: {
            dot: [],
        },
        ios_Activity: {
            dot: [],
        },
        google: {
            dot: [],
        },
        google_Activity: {
            dot: [],
        },
        instagram: {
            dot: [],
        },
        instagram_Activity: {
            dot: [],
        },
    };

    /**
     * RxJS card state
     *
     * @memberof QaCardService
     */
    public qaCardState = new Subject<any>();
    qaCardState$ = this.qaCardState.asObservable();

    public qaCardImageAspectRatio = new BehaviorSubject<string>("rectangle");
    qaCardImageAspectRatio$ = this.qaCardImageAspectRatio.asObservable();

    /**
     * set RxJS state
     *
     * @param {*} value
     * @memberof QaCardService
     */
    setState(value: any): void {
        this.qaCardState.next(value);
    }

    /**
     * set image aspect ratio
     *
     * @param {*} value
     * @memberof QaCardService
     */
    setImgAspectRatio(value: any): void {
        this.qaCardImageAspectRatio.next(value);
    }
}
