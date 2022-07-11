import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-mediaCard service
 *
 * @export
 * @class QaMediaCardService
 */
@Injectable({
    providedIn: "root",
})
export class QaMediaCardService {
    constructor() {}

    /**
     * RxJS mediaCard state
     *
     * @memberof QaMediaCardService
     */
    public qaMediaCardState = new Subject<any>();
    qaMediaCardState$ = this.qaMediaCardState.asObservable();

    /**
     * set mediaCard state
     *
     * @param {*} value
     * @memberof QaMediaCardService
     */
    setState(value: any): void {
        this.qaMediaCardState.next(value);
    }
}
