import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@core/utils';
import { NbDialogRef } from '@nebular/theme';

/**
 * Alert Dialog Component
 *
 * @export
 * @class AlertDialogComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'cbe-shared-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(private nbDialogRef: NbDialogRef<AlertDialogComponent>, private languageService: LanguageService) {
        this.languageService.language$.subscribe(() => {
            this.DIALOG = this.languageService.getLanguages('DIALOG');
        });
    }

    DIALOG: any;

    title = '';

    content = '';

    /**
     * close
     *
     * @memberof AlertDialogComponent
     */
    close() {
        this.nbDialogRef.close({ action: 'close' });
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.nbDialogRef = null;
    }
}
