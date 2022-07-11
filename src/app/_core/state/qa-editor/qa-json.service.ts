import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-json service
 *
 * @export
 * @class QaJsonService
 */
@Injectable({
    providedIn: "root",
})
export class QaJsonService {
    constructor() {}

    /**
     * RxJS json state
     *
     * @memberof QaJsonService
     */
    public qaJsonState = new Subject<any>();
    qaJsonState$ = this.qaJsonState.asObservable();

    /**
     * set json state
     *
     * @param {*} value
     * @memberof QaJsonService
     */
    setState(value: any): void {
        this.qaJsonState.next(value);
    }
}
