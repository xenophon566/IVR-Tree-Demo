import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-file service
 *
 * @export
 * @class QaFileService
 */
@Injectable({
    providedIn: "root",
})
export class QaFileService {
    constructor() {}

    /**
     * RxJS file state
     *
     * @memberof QaFileService
     */
    public qaFileState = new Subject<any>();
    qaFileState$ = this.qaFileState.asObservable();

    /**
     * set file state
     *
     * @param {*} value
     * @memberof QaFileService
     */
    setState(value: any): void {
        this.qaFileState.next(value);
    }
}
