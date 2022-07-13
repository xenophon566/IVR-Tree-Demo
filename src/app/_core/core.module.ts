import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConfigModule, ConfigService } from "@core/services/config.service";
import { CORE_SERVICES_PROVIDERS } from "./services.define";
import { CORE_UTILS_PROVIDERS } from "./utils.define";
import { CORE_STATE_PROVIDERS } from "./state.define";

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
            providers: [
                ConfigModule.init(),
                ConfigService,
                ...CORE_SERVICES_PROVIDERS,
                ...CORE_UTILS_PROVIDERS,
                ...CORE_STATE_PROVIDERS,
            ],
        };
    }
}
