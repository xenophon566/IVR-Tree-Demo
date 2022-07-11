import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@core/utils';

import { NbDialogRef } from '@nebular/theme';

@Component({
    selector: 'cbe-template-dialog',
    templateUrl: './template-dialog.component.html',
    styleUrls: ['./template-dialog.component.scss'],
})
export class TemplateDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(private nbDialogRef: NbDialogRef<TemplateDialogComponent>, private languageService: LanguageService) {
        this.DIALOG = this.languageService.getLanguages('DIALOG');
    }

    DIALOG: any;

    title = '';

    content = '';

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.nbDialogRef = null;
    }
}
