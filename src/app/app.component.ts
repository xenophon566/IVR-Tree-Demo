import { Component } from "@angular/core";
import { GlobalService } from "@core/services";
import { LanguageService, UtilitiesService } from "@core/utils";
import { NbIconLibraries } from "@nebular/theme";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
})
export class AppComponent {
    constructor(
        private globalService: GlobalService,
        private utilitiesService: UtilitiesService,
        private languageService: LanguageService,
        private nbIconLibraries: NbIconLibraries
    ) {
        // set user language family
        this.languageService.setLang();
        // set languages to local storage
        this.languageService.language$.subscribe((resp) => {
            this.globalService.globalLangObj = resp.translations;
            const globalLangObjStr = JSON.stringify(this.globalService.globalLangObj);
            localStorage.setItem("languages", globalLangObjStr);
        });

        // register Font Awesome
        this.nbIconLibraries.registerFontPack("font-awesome", {
            packClass: "fa",
            iconClassPrefix: "fa",
        });

        // register icon from assets
        // this.nbIconLibraries.registerSvgPack("card-operators", {
        //     resize: '<img src="assets/images/resize.svg" style="width: 0.8rem; margin-bottom: 0.2rem;"/>',
        // });
    }
}
