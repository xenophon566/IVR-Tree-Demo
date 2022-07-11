import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class PushNotificationService {
    constructor() {}

    selectData: any = {};

    mode: string = "";
}
