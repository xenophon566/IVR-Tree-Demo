import { Injectable } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { GLOBAL, SET_TIMEOUT } from "@core/services";
import * as CryptoJS from "crypto-js";
import html2canvas from "html2canvas";
import { environment } from "@env/environment";

/**
 * Utilities Service
 *
 * @export
 * @class UtilitiesService
 */
@Injectable({
    providedIn: "root",
})
export class UtilitiesService {
    /**
     * @ignore
     */
    constructor(private location: Location, private router: Router) {}

    cryptoToken: string = "AngularCBECrypto";

    RESULT_MESSAGE = GLOBAL.RESULT_MESSAGE + "(UtilitiesService) ";

    captureScreen(screen: any) {
        if (!screen) return;
        setTimeout(() => {
            html2canvas(screen.nativeElement).then((canvas) => {
                const screenDataUrl = canvas.toDataURL("image/png", 1);
                sessionStorage.setItem("screenDataUrl", screenDataUrl);
            });
        }, SET_TIMEOUT.NORMAL_SLOW);
    }

    /**
     * configParser
     *
     * @param {string} [configStr='']
     * @return {*}
     * @memberof UtilitiesService
     */
    configParser(configStr = "") {
        if (!!~configStr.indexOf("location")) return new Function("return " + configStr)() || "";
        else return configStr || "";
    }

    /**
     * getEnableChannels
     *
     * @param {string} [channelStr='']
     * @return {*}
     * @memberof UtilitiesService
     */
    getEnableChannels(channelStr = "") {
        const channels = channelStr.split(",");
        if (!channels[0]) return;
        const omnichannel = [];
        for (const channel of channels) omnichannel.push(channel);
        this.sortArrByOrder(omnichannel, GLOBAL.CHANNEL_ORDER.split(","));

        return omnichannel;
    }

    /**
     * 路由到指定的 url
     *
     * @param {string} url - 給定路由 url
     * @memberof UtilitiesService
     */
    navigateTo(url: string): void {
        this.router.navigate([url]);
    }

    /**
     * encryptAES256
     *
     * @param {string} [unencrypted='']
     * @return {*}
     * @memberof UtilitiesService
     */
    encryptAES256(unencrypted = "") {
        if (!unencrypted) return;
        const key = CryptoJS.enc.Utf8.parse(this.cryptoToken);
        const iv = CryptoJS.enc.Utf8.parse(this.cryptoToken);
        const encrypted = CryptoJS.AES.encrypt(unencrypted, key, {
            keySize: 16,
            iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        return encrypted.toString();
    }

    /**
     * decryptAES256
     *
     * @param {string} [encrypted='']
     * @return {*}
     * @memberof UtilitiesService
     */
    decryptAES256(encrypted = "") {
        if (!encrypted) return "";
        const key = CryptoJS.enc.Utf8.parse(this.cryptoToken);
        const iv = CryptoJS.enc.Utf8.parse(this.cryptoToken);
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            keySize: 16,
            iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * setEncryptData
     *
     * @param {string} key
     * @param {*} data
     * @memberof UtilitiesService
     */
    setEncryptData(key, data) {
        const encryptData = localStorage.getItem("encryptData");
        const decryptData = this.decryptAES256(encryptData);
        const decryptDataObj = !!decryptData ? JSON.parse(decryptData) : {};
        decryptDataObj[key] = data;
        localStorage.setItem("encryptData", this.encryptAES256(JSON.stringify(decryptDataObj)));
    }

    /**
     * getEncryptData
     *
     * @param {*} key
     * @return {*}
     * @memberof UtilitiesService
     */
    getEncryptData(key = "") {
        const encryptData = localStorage.getItem("encryptData");
        if (!!encryptData) {
            const decryptData = this.decryptAES256(encryptData);
            const decryptDataObj = JSON.parse(decryptData || "{}");
            return !!key ? decryptDataObj[key] : decryptDataObj;
        } else return {};
    }

    /**
     * setEncryptStringByKey
     *
     * @param {string} key
     * @param {string | number} value
     * @memberof UtilitiesService
     */
    setEncryptStringByKey(key, value) {
        const storageVal = typeof value !== "string" ? JSON.stringify(value) : value;
        localStorage.setItem(key, this.encryptAES256(storageVal));
    }

    /**
     * getEncryptStringByKey
     *
     * @return {object} decryptData
     * @memberof UtilitiesService
     */
    getEncryptStringByKey(key = "") {
        if (!!localStorage.getItem("CBEtenantList")) {
            this.setEncryptStringByKey("tenantList", localStorage.getItem("tenantList"));
            localStorage.removeItem("CBEtenantList");
        }

        if (!!key && localStorage.getItem(key)) {
            const encryptData = localStorage.getItem(key);
            const decryptData = this.decryptAES256(encryptData);
            return decryptData || null;
        } else return null;
    }

    /**
     * setCookie
     *
     * @param {*} key
     * @param {*} value
     * @memberof UtilitiesService
     */
    setCookie(key, value) {
        const expires = new Date();
        expires.setTime(+expires + 600 * 60 * 1000);
        const dataString = key + "=" + encodeURIComponent(value);
        const expireString = expires ? ";expires=" + expires.toUTCString() : "";

        document.cookie = dataString + expireString + ";path=/";
    }

    /**
     * getCookie
     *
     * @param {*} key
     * @return {string} cookie string
     * @memberof UtilitiesService
     */
    getCookie(key) {
        const start = document.cookie.indexOf(key + "=");
        const len = start + key.length + 1;
        if (!start && key !== document.cookie.substring(0, key.length)) return null;
        if (!~start) return null;
        let end = document.cookie.indexOf(";", len);
        if (!~end) end = document.cookie.length;

        return decodeURIComponent(document.cookie.substring(len, end));
    }

    /**
     * delCookie
     *
     * @param {*} key
     * @memberof UtilitiesService
     */
    delCookie(key) {
        if (!!this.getCookie(key)) {
            const expires = new Date();
            expires.setTime(expires.getTime() - 1);
            const dataString = key + "=" + this.getCookie(key);
            const expireString = ";expires=" + expires.toUTCString();

            document.cookie = dataString + expireString + ";path=/";
        }
    }

    /**
     * open upload
     *
     * @param {*} elem
     * @memberof UtilitiesService
     */
    openUpload(elem) {
        elem.nativeElement.click();
    }

    /**
     * base64 to file
     *
     * @param {string} base64Image
     * @returns {Blob}
     * @memberof UtilitiesService
     */
    base64ToFile(base64Image: string): Blob {
        if (!base64Image) return;

        const split = base64Image.split(",");
        const type = split[0].replace("data:", "").replace(";base64", "");
        const byteString = atob(split[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i += 1) ia[i] = byteString.charCodeAt(i);

        return new Blob([ab], { type });
    }

    /**
     * base64toBlobUrl
     *
     * @param {*} base64
     * @param {string} [type='']
     * @param {string} [contentType='']
     * @param {number} [sliceSize=512]
     * @return {*}
     * @memberof UtilitiesService
     */
    base64toBlobUrl(base64, type = "", contentType = "", sliceSize = 512) {
        const byteArrays = [];
        for (let offset = 0; offset < base64.length; offset += sliceSize) {
            const slice = base64.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return type === "blob" ? blob : URL.createObjectURL(blob);
    }

    /**
     * sort object array by key
     *
     * @param {array} array
     * @param {string} key
     * @param {*} [sort='ASC']
     * @return {*} sorted result
     * @memberof UtilitiesService
     */
    sortObjArrByKey(array, key, sort: any = "ASC") {
        return array.sort((a, b) => {
            const x = a[key];
            const y = b[key];
            if (typeof sort === "object" && !!sort.length) {
                const c = sort.indexOf(x);
                const d = sort.indexOf(y);
                return c < d ? -1 : c > d ? 1 : 0;
            } else if (sort.toUpperCase() === "DESC") {
                return x < y ? 1 : x > y ? -1 : 0;
            } else return x < y ? -1 : x > y ? 1 : 0;
        });
    }

    /**
     * sort array by order
     *
     * @param {array} array
     * @param {*} [sort='ASC']
     * @return {*} sorted result
     * @memberof UtilitiesService
     */
    sortArrByOrder(array, sort: any = "ASC") {
        return array.sort((a, b) => {
            if (typeof sort === "object" && !!sort.length) {
                const c = sort.indexOf(a);
                const d = sort.indexOf(b);
                return c < d ? -1 : c > d ? 1 : 0;
            } else if (sort.toUpperCase() === "DESC") {
                return a < b ? 1 : a > b ? -1 : 0;
            } else return a < b ? -1 : a > b ? 1 : 0;
        });
    }

    /**
     * sortObjByOrder
     *
     * @param {*} object
     * @param {*} [sort='ASC']
     * @return {*} sorted result
     * @memberof UtilitiesService
     */
    sortObjByOrder(object, sort: any = "ASC") {
        return Object.keys(object)
            .sort((a, b) => {
                if (typeof sort === "object" && !!sort.length) {
                    const c = sort.indexOf(a);
                    const d = sort.indexOf(b);
                    return c < d ? -1 : c > d ? 1 : 0;
                } else if (sort.toUpperCase() === "DESC") {
                    return a < b ? 1 : a > b ? -1 : 0;
                } else return a < b ? -1 : a > b ? 1 : 0;
            })
            .reduce((obj, key) => {
                obj[key] = object[key];
                return obj;
            }, {});
    }

    /**
     * clear state object
     *
     * @param {*} stateObject
     * @param {string} channel
     * @memberof UtilitiesService
     */
    clearStateObject(stateObject: any, channel: string) {
        for (const i in stateObject) {
            if (!!~["qaReplyObj", "qaWebviewObj", "qaPlayObj", "qaCommandObj"].indexOf(i)) {
                if (!!stateObject[i].result) delete stateObject[i].result[channel];
            } else {
                for (const j in stateObject[i].result) {
                    if (stateObject[i].result[j].channel === channel) delete stateObject[i].result[j];
                }
            }
        }
    }

    /**
     * scan QaEditor Object
     *
     * @param {*} $scope
     * @param {string[]} channel
     * @param {*} qaEditorObj
     * @returns
     * @memberof UtilitiesService
     */
    scanQaEditorObj($scope, channel: string[], qaEditorObj: any) {
        if (!$scope) return;

        const stateObject = $scope.qaEditorService.stateObject;
        for (const i of channel) {
            qaEditorObj.result = qaEditorObj.result || {};
            qaEditorObj.result[i] = [];
            for (const j in stateObject) {
                for (const k in stateObject[j].result) {
                    if (stateObject[j].result[k].channel === i) {
                        const idx = $scope.qaEditorService.qaEditorOrderList[i].indexOf(k);
                        const resultObj = stateObject[j].result[k];
                        if (j === "qaReplyObj" || j === "qaWebviewObj") resultObj.key = 99;
                        else if (!!~idx) resultObj.key = idx;

                        // push to result array
                        if (!!~resultObj.key) qaEditorObj.result[i].push(resultObj);
                    }
                }
            }

            this.sortObjArrByKey(qaEditorObj.result[i], "key");
        }

        return qaEditorObj;
    }

    /**
     * scan QaEditor Answer Type
     *
     * @param {*} $scope
     * @param {string[]} channel
     * @param {*} qaEditorObj
     * @returns
     * @memberof UtilitiesService
     */
    scanQaEditorAnswerType($scope, channel: string[], qaEditorObj: any) {
        if (!$scope) return;

        const stateObject = $scope.qaEditorService.stateObject;
        const answerTypeArr = [];
        for (const i of channel) {
            for (const j in stateObject) {
                for (const k in stateObject[j].result) {
                    if (stateObject[j].result[k].channel === i) {
                        const resultObj = stateObject[j].result[k];
                        answerTypeArr.push(resultObj.type);
                    }
                }
            }
        }

        return answerTypeArr;
    }

    /**
     * do upload file
     *
     * @param {*} $scope
     * @param {string} doUploadFileApi
     * @param {*} postBody
     * @returns {Promise<any>}
     * @memberof UtilitiesService
     */
    async doUploadFile($scope, doUploadFileApi: string, postBody: any): Promise<any> {
        if (!$scope) return;

        const result = await $scope.httpService.httpPOST(doUploadFileApi, postBody, $scope.component);
        if (result.message) {
            console.error("do doUploadFile Function API Fail. Error: " + result);
            $scope.hasError = true;
        }

        return result;
    }
}
