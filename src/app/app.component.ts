import { Component } from "@angular/core";
import { GlobalService } from "@core/services";
import { LanguageService, UtilitiesService } from "@core/utils";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
})
export class AppComponent {
    constructor(
        private globalService: GlobalService,
        private utilitiesService: UtilitiesService,
        private languageService: LanguageService
    ) {
        // set user language family
        this.languageService.setLang();
        // set languages to local storage
        this.languageService.language$.subscribe((resp) => {
            this.globalService.globalLangObj = resp.translations;
            const globalLangObjStr = JSON.stringify(this.globalService.globalLangObj);
            localStorage.setItem("languages", globalLangObjStr);
        });
    }
}
