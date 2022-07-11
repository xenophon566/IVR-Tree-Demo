import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * AnalyzerService
 *
 * @export
 * @class AnalyzerService
 */
@Injectable({
    providedIn: "root",
})
export class AnalyzerService {
    constructor() {}

    /**
     * isDrawChart
     *
     * @memberof AnalyzerService
     */
    public isDrawChart = new Subject<any>();

    /**
     * isDrawChart$
     *
     * @memberof AnalyzerService
     */
    isDrawChart$ = this.isDrawChart.asObservable();

    /**
     * setIsDrawChart
     *
     * @param {boolean} flag
     * @memberof AnalyzerService
     */
    setIsDrawChart(flag: boolean): void {
        this.isDrawChart.next(flag);
    }

    /**
     * isNoRecord
     *
     * @memberof AnalyzerService
     */
    public isNoRecord = new Subject<any>();

    /**
     * isNoRecord$
     *
     * @memberof AnalyzerService
     */
    isNoRecord$ = this.isNoRecord.asObservable();

    /**
     * setIsDrawChart
     *
     * @param {boolean} flag
     * @memberof AnalyzerService
     */
    setIsNoRecord(flag: boolean): void {
        this.isNoRecord.next(flag);
    }

    /**
     * compareDateObj
     *
     * @memberof AnalyzerService
     */
    public compareDateObj = new Subject<any>();

    /**
     * compareDateObj$
     *
     * @memberof AnalyzerService
     */
    compareDateObj$ = this.compareDateObj.asObservable();

    /**
     * setCompareDate
     *
     * @param {object} dateObj
     * @memberof AnalyzerService
     */
    setCompareDate(dateObj: object): void {
        this.compareDateObj.next(dateObj);
    }

    /**
     * tenants by rxjs
     *
     * @memberof AnalyzerService
     */
    public tenants = new Subject<any>();

    /**
     * tenants$
     *
     * @memberof AnalyzerService
     */
    tenants$ = this.tenants.asObservable();

    /**
     * setTenants
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setTenants(value: any): void {
        this.tenants.next(value);
    }

    /**
     * platforms by rxjs
     *
     * @memberof AnalyzerService
     */
    public platforms = new Subject<any>();

    /**
     * platforms$
     *
     * @memberof AnalyzerService
     */
    platforms$ = this.platforms.asObservable();

    /**
     * setPlatforms
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setPlatforms(value: any): void {
        this.platforms.next(value);
    }

    /**
     * activeUser by rxjs
     *
     * @memberof AnalyzerService
     */
    public activeUser = new Subject<any>();

    /**
     * activeUser$
     *
     * @memberof AnalyzerService
     */
    activeUser$ = this.activeUser.asObservable();

    /**
     * setActiveUser
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setActiveUser(value: any): void {
        this.activeUser.next(value);
    }

    /**
     * activeUserCompare by rxjs
     *
     * @memberof AnalyzerService
     */
    public activeUserCompare = new Subject<any>();

    /**
     * activeUserCompare$
     *
     * @memberof AnalyzerService
     */
    activeUserCompare$ = this.activeUserCompare.asObservable();

    /**
     * activeUserCompare
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setActiveUserCompare(value: any): void {
        this.activeUserCompare.next(value);
    }

    /**
     * hitTypeRatioCompare by rxjs
     *
     * @memberof AnalyzerService
     */
    public hitTypeRatioCompare = new Subject<any>();

    /**
     * hitTypeRatioCompare$
     *
     * @memberof AnalyzerService
     */
    hitTypeRatioCompare$ = this.hitTypeRatioCompare.asObservable();

    /**
     * hitTypeRatioCompare
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setHitTypeRatioCompare(value: any): void {
        this.hitTypeRatioCompare.next(value);
    }

    /**
     * matchType by rxjs
     *
     * @memberof AnalyzerService
     */
    public matchType = new Subject<any>();

    /**
     * matchType$
     *
     * @memberof AnalyzerService
     */
    matchType$ = this.matchType.asObservable();

    /**
     * setMatchType
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setMatchType(value: any): void {
        this.matchType.next(value);
    }

    /**
     * matchClass by rxjs
     *
     * @memberof AnalyzerService
     */
    public matchClass = new Subject<any>();

    /**
     * matchClass$
     *
     * @memberof AnalyzerService
     */
    matchClass$ = this.matchClass.asObservable();

    /**
     * setMatchClass
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setMatchClass(value: any): void {
        this.matchClass.next(value);
    }

    /**
     * questionClassTrend
     *
     * @memberof AnalyzerService
     */
    public questionClassTrend = new Subject<any>();

    /**
     * questionClassTrend$
     *
     * @memberof AnalyzerService
     */
    questionClassTrend$ = this.questionClassTrend.asObservable();

    /**
     * setQuestionClassTrend
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setQuestionClassTrend(value: any): void {
        this.questionClassTrend.next(value);
    }

    /**
     * hitTypeRatio
     *
     * @memberof AnalyzerService
     */
    public hitTypeRatio = new Subject<any>();

    /**
     * hitTypeRatio$
     *
     * @memberof AnalyzerService
     */
    hitTypeRatio$ = this.hitTypeRatio.asObservable();

    /**
     * setHitTypeRatio
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setHitTypeRatio(value: any): void {
        this.hitTypeRatio.next(value);
    }

    /**
     * questionTrend
     *
     * @memberof AnalyzerService
     */
    public questionTrend = new Subject<any>();

    /**
     * questionTrend$
     *
     * @memberof AnalyzerService
     */
    questionTrend$ = this.questionTrend.asObservable();

    /**
     * setQuestionTrend
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setQuestionTrend(value: any): void {
        this.questionTrend.next(value);
    }

    /**
     * questionTypeTrend
     *
     * @memberof AnalyzerService
     */
    public questionTypeTrend = new Subject<any>();

    /**
     * questionTypeTrend$
     *
     * @memberof AnalyzerService
     */
    questionTypeTrend$ = this.questionTypeTrend.asObservable();

    /**
     * setQuestionTypeTrend
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setQuestionTypeTrend(value: any): void {
        this.questionTypeTrend.next(value);
    }

    /**
     * userRetention
     *
     * @memberof AnalyzerService
     */
    public userRetention = new Subject<any>();

    /**
     * userRetention$
     *
     * @memberof AnalyzerService
     */
    userRetention$ = this.userRetention.asObservable();

    /**
     * setUserRetention
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setUserRetention(value: any): void {
        this.userRetention.next(value);
    }

    /**
     * userInteractive
     *
     * @memberof AnalyzerService
     */
    public userInteractive = new Subject<any>();

    /**
     * userInteractive$
     *
     * @memberof AnalyzerService
     */
    userInteractive$ = this.userInteractive.asObservable();

    /**
     * setUserInteractive
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setUserInteractive(value: any): void {
        this.userInteractive.next(value);
    }

    /**
     * chatFlow
     *
     * @memberof AnalyzerService
     */
    public chatFlow = new Subject<any>();

    /**
     * chatFlow$
     *
     * @memberof AnalyzerService
     */
    chatFlow$ = this.chatFlow.asObservable();

    /**
     * setChatFlow
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setChatFlow(value: any): void {
        this.chatFlow.next(value);
    }

    /**
     * transferAgent
     *
     * @memberof AnalyzerService
     */
    public transferAgent = new Subject<any>();

    /**
     * transferAgent$
     *
     * @memberof AnalyzerService
     */
    transferAgent$ = this.transferAgent.asObservable();

    /**
     * setTransferAgent
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setTransferAgent(value: any): void {
        this.transferAgent.next(value);
    }

    /**
     * substanceChatFlow
     *
     * @memberof AnalyzerService
     */
    public substanceChatFlow = new Subject<any>();

    /**
     * substanceChatFlow$
     *
     * @memberof AnalyzerService
     */
    substanceChatFlow$ = this.substanceChatFlow.asObservable();

    /**
     * setSubstanceChatFlow
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setSubstanceChatFlow(value: any): void {
        this.substanceChatFlow.next(value);
    }

    /**
     * nodeLen by rxjs
     *
     * @memberof AnalyzerService
     */
    public nodeLen = new Subject<any>();

    /**
     * nodeLen$
     *
     * @memberof AnalyzerService
     */
    nodeLen$ = this.nodeLen.asObservable();

    /**
     * setNodeLen
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setNodeLen(value: any): void {
        this.nodeLen.next(value);
    }

    dateRange = new Subject<any>();

    /**
     * dateRange$
     *
     * @memberof AnalyzerService
     */
    dateRange$ = this.dateRange.asObservable();

    /**
     * setDateRange
     *
     * @param {*} value
     * @memberof AnalyzerService
     */
    setDateRange(value: any): void {
        this.dateRange.next(value);
    }
}
