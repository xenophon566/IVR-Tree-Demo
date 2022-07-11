import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class EnterpriseService {
    constructor() {}

    public enterpriseMode = new BehaviorSubject<any>("");
    enterpriseMode$ = this.enterpriseMode.asObservable();

    setEnterpriseMode(mode: string) {
        this.enterpriseMode.next(mode);
    }
}
