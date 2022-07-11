import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * qa-audio service
 *
 * @export
 * @class QaAudioService
 */
@Injectable({
    providedIn: "root",
})
export class QaAudioService {
    constructor() {}

    /**
     * RxJS audio state
     *
     * @memberof QaAudioService
     */
    public qaAudioState = new Subject<any>();
    qaAudioState$ = this.qaAudioState.asObservable();

    /**
     * set audio state
     *
     * @param {*} value
     * @memberof QaAudioService
     */
    setState(value: any): void {
        this.qaAudioState.next(value);
    }
}
