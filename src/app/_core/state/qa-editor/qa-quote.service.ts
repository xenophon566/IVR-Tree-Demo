import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class QaQuoteService {
    constructor() {}

    /**
     * RxJS quote state
     *
     * @memberof QaQuoteService
     */
    public qaQuoteState = new Subject<any>();
    qaQuoteState$ = this.qaQuoteState.asObservable();

    /**
     * set quote state
     *
     * @param {*} value
     * @memberof QaQuoteService
     */
    setState(value: any): void {
        this.qaQuoteState.next(value);
    }
}
