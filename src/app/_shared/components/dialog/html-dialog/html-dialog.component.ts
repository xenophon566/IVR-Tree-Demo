import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@core/utils';

import { NbDialogRef } from '@nebular/theme';

@Component({
    selector: 'cbe-html-dialog',
    templateUrl: './html-dialog.component.html',
    styleUrls: ['./html-dialog.component.scss'],
})
export class HtmlDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(private nbDialogRef: NbDialogRef<HtmlDialogComponent>, private languageService: LanguageService) {
        this.DIALOG = this.languageService.getLanguages('DIALOG');
    }

    DIALOG: any;

    content = '';

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.nbDialogRef = null;
    }
}
