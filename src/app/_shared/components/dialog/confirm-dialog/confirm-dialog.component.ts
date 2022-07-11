import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@core/utils';

import { NbDialogRef } from '@nebular/theme';

/**
 * Confirm Dialog Component
 *
 * @export
 * @class ConfirmDialogComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'cbe-shared-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(private nbDialogRef: NbDialogRef<ConfirmDialogComponent>, private languageService: LanguageService) {
        this.DIALOG = this.languageService.getLanguages('DIALOG');
    }

    DIALOG: any;

    title = '';

    content = '';

    /**
     * cancel button
     *
     * @memberof ConfirmDialogComponent
     */
    cancel() {
        this.nbDialogRef.close({ action: 'cancel' });
    }

    /**
     * confirm button
     *
     * @memberof ConfirmDialogComponent
     */
    confirm() {
        this.nbDialogRef.close({ action: 'confirm' });
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.nbDialogRef = null;
    }
}
