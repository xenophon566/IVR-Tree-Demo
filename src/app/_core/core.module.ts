import { NgModule, ModuleWithProviders, LOCALE_ID } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CORE_SERVICES_PROVIDERS } from "./services.define";
import { CORE_UTILS_PROVIDERS } from "./utils.define";

/**
 * Core Module
 *
 * @export
 * @class CoreModule
 */
@NgModule({
    declarations: [],
    imports: [CommonModule],
})
export class CoreModule {
    /**
     * Core Module for Root
     *
     * @static
     * @returns {ModuleWithProviders<CoreModule>}
     * @memberof CoreModule
     */
    static forRoot(): ModuleWithProviders<CoreModule> {
        return {
            ngModule: CoreModule,
            providers: [...CORE_SERVICES_PROVIDERS, ...CORE_UTILS_PROVIDERS],
        };
    }
}
