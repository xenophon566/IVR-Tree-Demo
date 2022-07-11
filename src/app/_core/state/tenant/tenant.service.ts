import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class TenantService {
    constructor() {}

    public tenantMode = new BehaviorSubject<any>("");
    tenantMode$ = this.tenantMode.asObservable();
    setTenantMode(mode: any): void {
        this.tenantMode.next(mode);
    }

    public isChangeTenant = new Subject<any>();
    isChangeTenant$ = this.isChangeTenant.asObservable();
    setChangeTenant(value: any): void {
        this.isChangeTenant.next(value);
    }
}
