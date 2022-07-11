import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-link service
 *
 * @export
 * @class QaLinkService
 */
@Injectable({
    providedIn: "root",
})
export class QaLinkService {
    constructor() {}

    /**
     * RxJS link state
     *
     * @memberof QaLinkService
     */
    public qaLinkState = new Subject<any>();
    qaLinkState$ = this.qaLinkState.asObservable();

    /**
     * set link state
     *
     * @param {*} value
     * @memberof QaLinkService
     */
    setState(value: any): void {
        this.qaLinkState.next(value);
    }
}
