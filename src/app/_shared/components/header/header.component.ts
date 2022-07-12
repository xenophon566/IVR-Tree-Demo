import { Component, Input, OnInit } from "@angular/core";
import { UtilitiesService } from "@core/utils";
import { NbMenuService, NbDialogService, NbSidebarService } from "@nebular/theme";
import { ProfileDialogComponent } from "./dialog/profile-dialog/profile-dialog.component";
import { TranslateService } from "@ngx-translate/core";

// services
import { LanguageService } from "@core/utils/language.service";

/**
 * Header Component
 *
 * @export
 * @class HeaderComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private translateService: TranslateService,
        private utilitiesService: UtilitiesService,
        private nbMenuService: NbMenuService,
        private nbSidebarService: NbSidebarService,
        private nbDialogService: NbDialogService,
        private languageService: LanguageService
    ) {
        this.translateService.get("HEADER.LANG").subscribe((resp) => this.getLang(resp));
    }

    @Input() isToggleBtn = true;

    @Input() isLangBtn = true;

    @Input() isUserBtn = true;

    trademark = "./assets/images/header/trademark.jpg";

    userName = decodeURIComponent(this.utilitiesService.getCookie("un") || "");

    portraitUrl = "";

    /**
     * open User Menu
     *
     * @memberof HeaderComponent
     */
    openUserMenu = [
        { title: "個人資料", tag: "/profile" },
        { title: "登出", tag: "/logout" },
    ];

    languageMenu = [{ title: "", tag: "" }];

    /**
     * 語言切換
     *
     * @param {*} data
     * @memberof HeaderComponent
     */
    getLang(data) {
        this.languageMenu = [
            { title: data.TW, tag: "zh-TW" },
            { title: data.US, tag: "en-US" },
        ];
    }

    /**
     * goHome
     *
     * @memberof HeaderComponent
     */
    goHome() {
        this.utilitiesService.navigateTo("/");
    }

    /**
     * toggle Sider Bar
     *
     * @memberof HeaderComponent
     */
    toggleSiderBar() {
        this.nbSidebarService.toggle(true, "left");
    }

    ngOnInit(): void {
        this.nbMenuService.onItemClick().subscribe((title: { item: any; tag: any }) => {
            if (title.item.tag === "zh-TW" || title.item.tag === "en-US") {
                this.languageService.setLang(title.item.tag);
                this.translateService.get("HEADER.LANG").subscribe((resp) => this.getLang(resp));
            }

            if (title.item.tag === "/profile") {
                this.nbDialogService
                    .open(ProfileDialogComponent, {
                        closeOnBackdropClick: true,
                    })
                    .onClose.subscribe((nameObj) => {
                        // 訂閱 cbe-profile-dialog 關閉時的資訊
                        if (!!nameObj && !!nameObj.userName) {
                            this.userName = nameObj.userName;
                            console.log(this.userName);
                            // to do update userName
                        }
                    });
            }

            if (title.item.tag === "/logout") this.utilitiesService.logout();
        });
    }

    ngOnDestroy(): void {
        this.nbMenuService = null;
        this.nbDialogService = null;
    }
}
