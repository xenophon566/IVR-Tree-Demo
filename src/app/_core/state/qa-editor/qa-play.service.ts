import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class QaPlayService {
    constructor() {}

    /**
     * RxJS text state
     *
     * @memberof QaPlayService
     */
    public qaPlayState = new Subject<any>();
    qaPlayState$ = this.qaPlayState.asObservable();

    /**
     * set text state
     *
     * @param {*} value
     * @memberof QaPlayService
     */
    setState(value: any): void {
        this.qaPlayState.next(value);
    }
}
