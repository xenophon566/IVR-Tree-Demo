import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET } from "@angular/router";
import { filter } from "rxjs/operators";
import { LanguageService } from "@core/utils";

export interface Breadcrumb {
    label: string;
    url: string;
}
@Component({
    selector: "cbe-breadcrumb",
    templateUrl: "./breadcrumb.component.html",
    styleUrls: ["./breadcrumb.component.scss"],
})
export class BreadcrumbComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private languageService: LanguageService
    ) {}

    HOME = {};

    /**
     * routerEvents
     *
     * @type {*}
     * @memberof BreadcrumbComponent
     */
    routerEvents: any;

    /**
     * breadcrumb
     *
     * @memberof BreadcrumbComponent
     */
    breadcrumb = {
        label: "",
        url: location.pathname + "#/home/dashboard",
    };

    /**
     * breadcrumbs
     *
     * @memberof BreadcrumbComponent
     */
    breadcrumbs = [];

    /**
     * getBreadcrumbs
     *
     * @private
     * @param {ActivatedRoute} route
     * @param {string} [url='']
     * @param {Breadcrumb[]} [breadcrumbs=[]]
     * @return {*}  {Breadcrumb[]}
     * @memberof BreadcrumbComponent
     */
    private getBreadcrumbs(route: ActivatedRoute, url: string = "", breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
        this.breadcrumb.label = this.HOME["TITLE"];

        const children: ActivatedRoute[] = route.children;
        if (children.length === 0) return breadcrumbs;
        for (const child of children) {
            if (child.outlet !== PRIMARY_OUTLET || child.snapshot.url.length === 0) continue;
            if (!child.snapshot.data.hasOwnProperty("breadcrumbName"))
                return this.getBreadcrumbs(child, url, breadcrumbs);
            const routeURL: string = child.snapshot.url.map((segment) => segment.path).join("/");
            url += `/${routeURL}`;
            const M = child.snapshot?.data["moduleName"];
            const C = child.snapshot?.data["componentName"];
            let modules = null;
            for (const m of (M || "").split(".")) modules = !!modules ? modules[m] : this.HOME["MENU_ITEMS"][m];
            const labelName = M && C ? modules[C] : child.snapshot.data["breadcrumbName"];
            const breadcrumb: Breadcrumb = {
                label: !!labelName ? " > " + labelName : "",
                url: location.pathname + "#/home" + url,
            };
            breadcrumbs.push(breadcrumb);

            return this.getBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }

    /**
     * getBreadcrumbsContent
     *
     * @private
     * @memberof BreadcrumbComponent
     */
    private getBreadcrumbsContent() {
        const root: ActivatedRoute = this.activatedRoute.root;
        this.breadcrumbs = this.getBreadcrumbs(root);
        this.breadcrumbs = [this.breadcrumb, ...this.breadcrumbs];
    }

    ngOnInit(): void {
        this.routerEvents = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.getBreadcrumbsContent();
        });

        this.languageService.language$.subscribe(() => {
            this.HOME = JSON.parse(localStorage.getItem("languages"))?.HOME;
            this.getBreadcrumbsContent();
        });
    }

    ngOnDestroy(): void {
        this.routerEvents.unsubscribe();
        this.router = null;
    }
}
