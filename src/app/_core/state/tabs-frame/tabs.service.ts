import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * Tabs Service
 *
 * @export
 * @class TabsService
 */
@Injectable({
    providedIn: "root",
})
export class TabsService {
    constructor() {}

    /**
     * tabsState
     *
     * @memberof TabsService
     */
    public tabsState = new Subject<any>();

    /**
     * tabsState$
     *
     * @memberof TabsService
     */
    tabsState$ = this.tabsState.asObservable();

    /**
     * setState
     *
     * @param {*} value
     * @memberof TabsService
     */
    setState(value: any): void {
        this.tabsState.next(value);
    }
}
