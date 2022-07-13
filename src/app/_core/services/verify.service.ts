import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LanguageService } from "@core/utils/language.service";

/**
 * Verify Service
 *
 * @export
 * @class VerifyService
 */
@Injectable({
    providedIn: "root",
})
export class VerifyService {
    /**
     * @ignore
     */
    constructor(private translateService: TranslateService, private languageService: LanguageService) {
        this.VERIFY_SERVICE = this.languageService.getLanguages("VERIFY_SERVICE");
    }

    /**
     * verify service
     *
     * @type {*}
     * @memberof VerifyService
     */
    VERIFY_SERVICE: any;

    /**
     * Verify String
     *
     * @param {string} value - checked string value
     * @param {*} setting - verify type (errMsg priority is array index from big to small )
     * @return {*}
     * @memberof VerifyService
     */
    verify(value: string, setting) {
        const res = [];
        setting.forEach((item) => {
            const parameter = item.split(",");
            if (parameter.length === 2) {
                res.push({
                    action: parameter[0],
                    state: this[parameter[0]](value, parameter[1]),
                });
            } else if (parameter.length === 3) {
                res.push({
                    action: parameter[0],
                    state: this[parameter[0]](value, parameter[1], parameter[2]),
                });
            } else {
                res.push({
                    action: parameter[0],
                    state: this[parameter[0]](value),
                });
            }
        });

        let result = {};
        res.forEach((item) => {
            if (item.state.state === false) result = item.state;
        });

        if (!Object.keys(result).length) result = { state: true, errMsg: "" };

        return result;
    }

    /**
     * is Required
     *
     * @param {any} value
     * @returns
     * @memberof VerifyService
     */
    isRequired(value: any) {
        if (value === undefined || value === null) {
            return {
                state: false,
                errMsg: this.VERIFY_SERVICE.IS_REQUIRED,
            };
        }

        if (typeof value !== "string") value = value.toString();

        if (value.trim().length > 0) {
            return {
                state: true,
                errMsg: "",
            };
        } else {
            return {
                state: false,
                errMsg: this.VERIFY_SERVICE.IS_REQUIRED,
            };
        }
    }

    /**
     * max Length
     *
     * @param {string} value
     * @param {number} length
     * @returns
     * @memberof VerifyService
     */
    maxLength(value: string, length: number) {
        if (value === undefined)
            return {
                state: true,
                errMsg: "",
            };
        if (value.length <= length)
            return {
                state: true,
                errMsg: "",
            };
        else
            return {
                state: false,
                errMsg:
                    this.VERIFY_SERVICE.MAXLENGTH_LIMIT +
                    length +
                    this.VERIFY_SERVICE.MAXLENGTH_CURRENT +
                    value.length +
                    this.VERIFY_SERVICE.MAXLENGTH_WORD,
            };
    }

    /**
     * 檢查數字範圍
     *
     * @param {number} value
     * @param {string} min
     * @param {string} max
     * @return {*}
     * @memberof VerifyService
     */
    numberRange(value: number, min: string, max: string) {
        if (value === undefined)
            return {
                state: true,
                errMsg: "",
            };

        if (min !== undefined && max !== undefined) {
            const minValue = Number(min);
            const maxValue = Number(max);
            if (minValue <= value && value <= maxValue) {
                return {
                    state: true,
                    errMsg: "",
                };
            } else {
                return {
                    state: false,
                    errMsg:
                        this.VERIFY_SERVICE.NUMBER_RANGE +
                        minValue +
                        this.VERIFY_SERVICE.AND +
                        maxValue +
                        this.VERIFY_SERVICE.RANGE,
                };
            }
        }
    }

    /**
     * has https
     *
     * @param {string} value
     * @returns
     * @memberof VerifyService
     */
    hasHTTPS(value: string) {
        if (value.trim() === "") {
            return {
                state: true,
                errMsg: "",
            };
        } else {
            if (value.toLowerCase().indexOf("https://") !== -1)
                return {
                    state: true,
                    errMsg: "",
                };
            else
                return {
                    state: false,
                    errMsg: this.VERIFY_SERVICE.HAS_HTTPS,
                };
        }
    }

    /**
     * has HTTP
     *
     * @param {string} value
     * @returns
     * @memberof VerifyService
     */
    hasHTTP(value: string) {
        if (value.trim() === "") {
            return {
                state: true,
                errMsg: "",
            };
        } else {
            if (value.toLowerCase().indexOf("http://") !== -1 || value.toLowerCase().indexOf("https://") !== -1)
                return {
                    state: true,
                    errMsg: "",
                };
            else
                return {
                    state: false,
                    errMsg: this.VERIFY_SERVICE.HAS_HTTP,
                };
        }
    }

    /**
     * is facebook url
     *
     * @param {string} value
     * @returns
     * @memberof VerifyService
     */
    isFbUrl(value: string) {
        if (value.trim() === "") {
            return {
                state: true,
                errMsg: "",
            };
        } else {
            if (value.toLowerCase().indexOf("https://") !== -1)
                return {
                    state: true,
                    errMsg: "",
                };
            else
                return {
                    state: false,
                    errMsg: this.VERIFY_SERVICE.IS_FB_URL,
                };
        }
    }

    /**
     * max size
     *
     * @param {string} value
     * @param {number} maxSizeMB
     * @returns
     * @memberof VerifyService
     */
    maxSize(value: string, maxSizeMB: number) {
        if (Number(value) < maxSizeMB)
            return {
                state: true,
                errMsg: "",
            };
        else
            return {
                state: false,
                errMsg: this.VERIFY_SERVICE.MAXSIZE_LIMIT + maxSizeMB + " MB",
            };
    }

    /**
     * min Button Count
     *
     * @param {string} value
     * @param {number} minCount
     * @returns
     * @memberof VerifyService
     */
    minBtnCount(value: string, minCount: number) {
        if (Number(value) >= minCount)
            return {
                state: true,
                errMsg: "",
            };
        else
            return {
                state: false,
                errMsg: this.VERIFY_SERVICE.MINBTN_COUNT + minCount + this.VERIFY_SERVICE.MINBTN_UNIT,
            };
    }

    minCardCount(value: string, minCount: number) {
        if (Number(value) >= minCount) {
            return {
                state: true,
                errMsg: "",
            };
        } else {
            return {
                state: false,
                errMsg: this.VERIFY_SERVICE.MINBTN_COUNT + minCount + this.VERIFY_SERVICE.LEAST_CARD_NUMBER,
            };
        }
    }
}
