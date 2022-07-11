import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-video service
 *
 * @export
 * @class QaVideoService
 */
@Injectable({
    providedIn: "root",
})
export class QaVideoService {
    constructor() {}

    /**
     * RxJS video state
     *
     * @memberof QaVideoService
     */
    public qaVideoState = new Subject<any>();
    qaVideoState$ = this.qaVideoState.asObservable();

    /**
     * set video state
     *
     * @param {*} value
     * @memberof QaVideoService
     */
    setState(value: any): void {
        this.qaVideoState.next(value);
    }
}
