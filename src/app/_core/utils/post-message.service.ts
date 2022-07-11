import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { SET_TIMEOUT } from '@core/services';

/**
 * ### iframe 常數設定
 *
 * @export
 * @enum {number}
 */
export const enum IFRAME {
    ID = 'iframeToCBE',
}

/**
 * Post Message Service
 *
 * @export
 * @class PostMessageService
 */
@Injectable({
    providedIn: 'root',
})
export class PostMessageService {
    /**
     * @ignore
     */
    constructor(private languageService: LanguageService) {
        this.QA_EDITOR = this.languageService.getLanguages('QA_EDITOR');
    }

    /**
     * i18n QA_EDITOR
     *
     * @type {*}
     * @memberof PostMessageService
     */
    QA_EDITOR: any;

    /**
     * post message
     *
     * @param {string} [action='custom']
     * @param {*} [data={}]
     * @param {string} [url='*']
     * @memberof PostMessageService
     */
    postMessage(action = 'custom', data: any = {}, url = '*') {
        switch (action) {
            case 'showNotSupportError':
                parent.postMessage(
                    {
                        type: 'doSweetAlert',
                        data: {
                            title: this.QA_EDITOR.COMMON.ERROR,
                            text: this.QA_EDITOR.COMMON.NOT_SUPPORT_FILETYPE,
                            type: 'error',
                            confirmButtonText: this.QA_EDITOR.COMMON.COMFIRM,
                        },
                    },
                    url
                );
                break;
            case 'showUploadMaxError':
                parent.postMessage(
                    {
                        type: 'doSweetAlert',
                        data: {
                            title: this.QA_EDITOR.COMMON.ERROR,
                            text: this.QA_EDITOR.COMMON.UPLOAD_MAX_LIMITED_ERROR,
                            type: 'error',
                            confirmButtonText: this.QA_EDITOR.COMMON.COMFIRM,
                        },
                    },
                    url
                );
                break;
            case 'doConfirmSweetAlert':
                parent.postMessage(
                    {
                        type: 'doConfirmSweetAlert',
                        data: {
                            title: data.data.title,
                            text: data.data.text,
                            type: 'warning',
                            cancelButtonText: data.data.cancelButtonText || this.QA_EDITOR.COMMON.CANCEL,
                            confirmButtonText: data.data.confirmButtonText || this.QA_EDITOR.COMMON.COMFIRM,
                            callbackData: data.data.callbackData,
                        },
                    },
                    url
                );
                break;
            case 'doSweetAlert':
                parent.postMessage(JSON.parse(JSON.stringify(data)), url);
                break;
            case 'custom':
                parent.postMessage(JSON.parse(JSON.stringify(data)), url);
                break;
        }
    }

    /**
     * reloadIFrame
     *
     * @param {*} iframe
     * @param {*} [data={}]
     * @param {string} [url='*']
     * @memberof PostMessageService
     */
    reloadIFrame(iframe, data = {}, url = '*') {
        setTimeout(() => {
            if (!!iframe.contentWindow) {
                if (!!data && !!Object.keys(data).length) iframe.contentWindow.postMessage(data, url);
                else iframe.contentWindow.location.reload(true);
            } else console.error('iframe not found');
        }, SET_TIMEOUT.NORMAL);
    }

    /**
     * appendIFrame
     *
     * @memberof PostMessageService
     */
    appendIFrame() {
        if (!!document.getElementById(IFRAME.ID)) document.getElementById(IFRAME.ID).remove();

        const iframes = document.getElementsByTagName('iframe');
        let iframe = null;
        if (!iframes[0]) {
            iframe = document.createElement('iframe');
            iframe.src = './assets/cbe/index.html';
            iframe.id = IFRAME.ID;
            iframe.style = 'display:none';
            document.body.appendChild(iframe);
        } else iframe = iframes[0] || null;

        this.reloadIFrame(iframe);
    }

    /**
     * removeIFrame
     *
     * @memberof PostMessageService
     */
    removeIFrame() {
        if (!!document.getElementById(IFRAME.ID)) document.getElementById(IFRAME.ID).remove();
    }
}
