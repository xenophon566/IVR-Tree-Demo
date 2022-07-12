import { Component, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { UtilitiesService } from "@core/utils";

/**
 * Profile Dialog Component
 *
 * @export
 * @class ProfileDialogComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-profile-dialog",
    templateUrl: "./profile-dialog.component.html",
    styleUrls: ["./profile-dialog.component.scss"],
})
export class ProfileDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(protected dialogRef: NbDialogRef<ProfileDialogComponent>, private utilitiesService: UtilitiesService) {}

    userName = decodeURIComponent(this.utilitiesService.getCookie("un") || "");

    /**
     * cancel
     *
     * @memberof ProfileDialogComponent
     */
    cancel() {
        this.dialogRef.close();
    }

    /**
     * submit
     *
     * @param {*} userName
     * @memberof ProfileDialogComponent
     */
    submit(userName) {
        this.dialogRef.close({ userName });
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.dialogRef = null;
    }
}
