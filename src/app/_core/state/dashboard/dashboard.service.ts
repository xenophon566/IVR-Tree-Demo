import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
export const enum DASHBOARD_COMPONENT {
    ALL_CHANNELS = "web,ios,android,line,messenger,phone,google,instagram",
    CHANNELS_COLOR = "#ef6763,#fdc55e,#90cc73,#73bfde,#795548,#9a60b4,#fe09b1,#3f729b",
}

/**
 * Dashboard Service
 *
 * @export
 * @class DashboardService
 */
@Injectable({
    providedIn: "root",
})
export class DashboardService {
    constructor() {}

    /**
     * serviceStatistics by rxjs
     *
     * @memberof DashboardService
     */
    public serviceStatistics = new Subject<any>();
    serviceStatistics$ = this.serviceStatistics.asObservable();
    setServiceStatistics(value: any): void {
        this.serviceStatistics.next(value);
    }

    /**
     * qaRanking by rxjs
     *
     * @memberof DashboardService
     */
    public qaRanking = new Subject<any>();
    qaRanking$ = this.qaRanking.asObservable();
    setQaRanking(value: any): void {
        this.qaRanking.next(value);
    }

    /**
     * usageTrend by rxjs
     *
     * @memberof DashboardService
     */
    public usageTrend = new Subject<any>();
    usageTrend$ = this.usageTrend.asObservable();
    setUsageTrend(value: any): void {
        this.usageTrend.next(value);
    }

    /**
     * usageTrendRange by rxjs
     *
     * @memberof DashboardService
     */
    public usageTrendRange = new Subject<any>();
    usageTrendRange$ = this.usageTrendRange.asObservable();
    setUsageTrendRange(value: any): void {
        this.usageTrendRange.next(value);
    }
}
