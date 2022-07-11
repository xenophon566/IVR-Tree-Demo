import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * Tabs Frame Service
 *
 * @export
 * @class TabsFrameService
 */
@Injectable({
    providedIn: "root",
})
export class TabsFrameService {
    constructor() {}

    /**
     * tabsFrameState
     *
     * @memberof TabsFrameService
     */
    public tabsFrameState = new Subject<any>();

    /**
     * tabsFrameState$
     *
     * @memberof TabsFrameService
     */
    tabsFrameState$ = this.tabsFrameState.asObservable();

    /**
     * setState
     *
     * @param {*} value
     * @memberof TabsFrameService
     */
    setState(value: any): void {
        this.tabsFrameState.next(value);
    }
}
