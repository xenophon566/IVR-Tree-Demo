import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class PermissionGroupService {
    constructor() {}

    public permissionGroupMode = new BehaviorSubject<any>("");
    permissionGroupMode$ = this.permissionGroupMode.asObservable();
    setPermissionGroupMode(mode: any): void {
        this.permissionGroupMode.next(mode);
    }

    public isChangePermissionGroup = new Subject<any>();
    isChangePermissionGroup$ = this.isChangePermissionGroup.asObservable();
    setChangePermissionGroup(value: any): void {
        this.isChangePermissionGroup.next(value);
    }

    generateUUID() {
        let d = Date.now();
        if (typeof performance !== "undefined" && typeof performance.now === "function") {
            d += performance.now();
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }
}
