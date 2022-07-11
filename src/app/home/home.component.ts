import { Component, OnInit, VERSION } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
    constructor(private httpClient: HttpClient) {}

    i18n = JSON.parse(localStorage.getItem("languages"));

    version = VERSION.full;

    isLoading = false;

    chatroomList = [];

    ngOnInit(): void {
        this.isLoading = true;
        this.httpClient.get("http://localhost:3000/ecp-chatroom-list").subscribe((resp) => {
            this.chatroomList = resp["items"];

            setTimeout(() => {
                this.isLoading = false;
            }, 2e3);
        });
    }
}
