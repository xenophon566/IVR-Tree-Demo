import { Component, OnInit, VERSION, ChangeDetectorRef } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { UtilitiesService } from "@core/utils";

@Component({
    selector: "app-demo-firebase",
    templateUrl: "./demo-firebase.component.html",
    styleUrls: ["./demo-firebase.component.scss"],
})
export class DemoFirebaseComponent implements OnInit {
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private db: AngularFireDatabase,
        private utilitiesService: UtilitiesService
    ) {}

    name = "Angular " + VERSION.full;

    messages: any[] = [];

    key = "";

    value = "";

    getMessages() {
        this.db
            .list("demo")
            .valueChanges()
            .subscribe((r) => {
                this.messages = r;
                this.changeDetectorRef.detectChanges();
            });
    }

    ngOnInit() {
        const aaa = this.utilitiesService.sortArrByOrder([3, 4, 2, 1]);
        console.log(aaa);
    }

    ngAfterViewInit() {
        this.getMessages();
    }
}
