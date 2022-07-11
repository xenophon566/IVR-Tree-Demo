import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class QaTextIndependentService {
    constructor() {}

    /**
     * RxJS text state
     *
     * @memberof QaTextService
     */
    public qaTextState = new Subject<any>();
    qaTextState$ = this.qaTextState.asObservable();

    public qaTextVerify = new Subject<any>();
    qaTextVerify$ = this.qaTextVerify.asObservable();

    public qaTextDoVerify = new Subject<any>();
    qaTextDoVerify$ = this.qaTextDoVerify.asObservable();

    qaTextVerifySataus = true;

    /**
     * 設定答案
     *
     * @param {*} value
     * @memberof QaTextService
     */
    setState(value: any): void {
        this.qaTextState.next(value);
    }

    /**
     * 設定驗證狀態
     *
     * @param {*} value
     * @memberof QaTextIndependentService
     */
    setVerify(value: any): void {
        this.qaTextVerifySataus = value;
        this.qaTextVerify.next(value);
    }
    /**
     * 由父層元件主動觸發是否觸發驗證
     *
     *
     * @param {boolean} value
     * @memberof QaTextIndependentService
     */
    setDoVerify(value: boolean) {
        this.qaTextDoVerify.next(value);
    }
}
