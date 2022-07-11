import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class UserService {
    constructor() {}

    public userMode = new BehaviorSubject<any>("");
    userMode$ = this.userMode.asObservable();
    setUserMode(mode: string): void {
        this.userMode.next(mode);
    }
}
