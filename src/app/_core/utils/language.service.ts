import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { take } from "rxjs/operators";
import { environment } from "@env/environment";

/**
 * Language Service
 *
 * @export
 * @class LanguageService
 */
@Injectable({
    providedIn: "root",
})
export class LanguageService {
    /**
     * @ignore
     */
    constructor(private translateService: TranslateService) {}

    language$ = new ReplaySubject<LangChangeEvent>(1);

    langService: any = null;

    getLocale(): string {
        const localeStr = localStorage.getItem("lang") === "zh-TW" ? "zh-Hant" : "en";

        return localeStr;
    }

    /**
     * set i18n language
     *
     * @param {string} [language='']
     * @memberof LanguageService
     */
    setLang(language: string = "") {
        let lang = language || localStorage.getItem("lang") || navigator.language;
        localStorage.setItem("lang", lang);
        this.setLangRxjs(lang);
    }

    /**
     * set language RxJS
     *
     * @param {string} [lang='']
     * @memberof LanguageService
     */
    setLangRxjs(lang: string = "") {
        this.langService = this.translateService.onLangChange.pipe(take(1)).subscribe((result) => {
            this.language$.next(result);
        });
        this.translateService.use(lang);
    }

    /**
     * get i18n language
     *
     * @param {*} [module=null]
     * @returns
     * @memberof LanguageService
     */
    getLanguages(module = null) {
        const languages = localStorage.getItem("languages");
        if (!!languages && !!Object.keys(languages).length)
            return !!module ? JSON.parse(languages)[module] : JSON.parse(languages);
        else {
            this.language$.subscribe((resp) => {
                return !!module ? resp.translations[module] : resp.translations;
            });
        }
    }

    /**
     * recursiveLangAppend
     *
     * i18n recursive of menu structure
     *
     * @param {object} langData
     * @param {object} item
     * @return {string} item.title
     * @memberof LanguageService
     */
    recursiveLangAppend(langData, item) {
        if (!langData || !item) return "";

        if (!!item.children) {
            item.children.forEach((element) => {
                return this.recursiveLangAppend(langData, element);
            });
        }

        if (item.key.split(".").length > 1) {
            let childTitleObj = {};
            let childTitle = "";
            item.key.split(".").forEach((val) => {
                if (!!Object.keys(childTitleObj).length) {
                    childTitle = childTitleObj[val];
                    childTitleObj = childTitleObj[val];
                } else childTitleObj = langData[val];
            });
            item.title = childTitle;
        } else item.title = langData[item.key];

        return item.title;
    }
}
