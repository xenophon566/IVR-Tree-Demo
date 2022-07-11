import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-image service
 *
 * @export
 * @class QaImageService
 */
@Injectable({
    providedIn: "root",
})
export class QaImageService {
    constructor() {}

    /**
     * RxJS image state
     *
     * @memberof QaImageService
     */
    public qaImageState = new Subject<any>();
    qaImageState$ = this.qaImageState.asObservable();

    /**
     * set image state
     *
     * @param {*} value
     * @memberof QaImageService
     */
    setState(value: any): void {
        this.qaImageState.next(value);
    }
}
