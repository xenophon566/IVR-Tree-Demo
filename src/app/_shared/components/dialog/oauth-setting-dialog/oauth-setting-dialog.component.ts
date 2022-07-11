import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@core/utils';

import { NbDialogRef } from '@nebular/theme';

@Component({
    selector: 'cbe-oauth-setting-dialog',
    templateUrl: './oauth-setting-dialog.component.html',
    styleUrls: ['./oauth-setting-dialog.component.scss'],
})
export class OauthSettingDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private nbDialogRef: NbDialogRef<OauthSettingDialogComponent>,
        private languageService: LanguageService
    ) {
        this.DIALOG = this.languageService.getLanguages('DIALOG');
    }

    DIALOG: any;

    type = '';

    data = {};

    showPassword = false;

    selectedItem = '';

    oauthChannelList = [];

    oauthSettingList = {
        FOAuthTokenUrl: '',
        FOAuthAuthorizeUrl: '',
        FOAuthClientId: '',
        FOAuthClientSecret: '',
        FOAuthScope: '',
        FOAuthAnswerEnable: false,
    };

    toggleShowPassword(isShow = false) {
        this.showPassword = isShow;
    }

    confirm() {
        this.nbDialogRef.close({
            action: 'confirm',
            response: {
                selectedItem: this.selectedItem,
                oauthSettingList: this.oauthSettingList,
            },
        });
    }

    cancel() {
        this.nbDialogRef.close({ action: 'cancel' });
    }

    ngOnInit(): void {
        this.oauthChannelList = this.data?.['oauthChannelList'];
        this.selectedItem = this.data?.['oauthSettingList']?.FShowChannel || this.oauthChannelList[0].text || '';
        this.oauthSettingList = this.data?.['oauthSettingList'] || {};
    }

    ngOnDestroy(): void {
        this.nbDialogRef = null;
        this.data = null;
        this.selectedItem = null;
        this.oauthChannelList = null;
        this.oauthSettingList = null;
    }
}
