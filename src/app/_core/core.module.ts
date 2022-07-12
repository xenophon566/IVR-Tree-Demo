import { NgModule, ModuleWithProviders, LOCALE_ID } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConfigModule, ConfigService } from "@core/services/config.service";
import { CORE_SERVICES_PROVIDERS } from "./services.define";
import { CORE_UTILS_PROVIDERS } from "./utils.define";
// import { CORE_STATE_PROVIDERS } from "./state.define";
import { AnalyzerService } from "./state/analyzer/analyzer.service";
import { QaTextService } from "./state/qa-editor/qa-text.service";
import { QaImageService } from "./state/qa-editor/qa-image.service";
import { QaCardService } from "./state/qa-editor/qa-card.service";
import { CardContentService } from "./state/qa-editor/card-content.service";
import { QaAudioService } from "./state/qa-editor/qa-audio.service";
import { QaFileService } from "./state/qa-editor/qa-file.service";
import { QaVideoService } from "./state/qa-editor/qa-video.service";
import { QaLinkService } from "./state/qa-editor/qa-link.service";
import { QaJsonService } from "./state/qa-editor/qa-json.service";
import { QaWebviewService } from "./state/qa-editor/qa-webview.service";
import { QaReplyService } from "./state/qa-editor/qa-reply.service";
import { ReplyContentService } from "./state/qa-editor/reply-content.service";
import { QaMediaCardService } from "./state/qa-editor/qa-mediaCard.service";
import { QaEditorService } from "./state/qa-editor/qa-editor.service";
import { TabsFrameService } from "./state/tabs-frame/tabs-frame.service";
import { TabsService } from "./state/tabs-frame/tabs.service";
import { SmartQaEditorService } from "./state/smart-qa-editor/smart-qa-editor.service";
import { GreetingEditorService } from "./state/greeting-editor/greeting-editor.service";
import { MarketContentEditorService } from "./state/market-content-editor/market-content-editor.service";
import { DashboardService } from "./state/dashboard/dashboard.service";
import { TenantService } from "./state/tenant/tenant.service";
import { UserService } from "./state/user/user.service";
import { EnterpriseService } from "./state/enterprise/enterprise.service";
import { SatisfactionSurveyEditorService } from "./state/satisfaction-survey-editor/satisfaction-survey-editor.service";
import { QaTextIndependentService } from "./state/components/qa-text-independent.service";
import { PermissionGroupService } from "./state/permission-group/permission-group.service";
import { QaPlayService } from "./state/qa-editor/qa-play.service";
import { PushNotificationService } from "./state/push-notification/push-notification.service";
import { QaQuoteService } from "./state/qa-editor/qa-quote.service";

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
                // ...CORE_STATE_PROVIDERS,
                AnalyzerService,
                DashboardService,
                QaTextService,
                QaImageService,
                QaCardService,
                CardContentService,
                QaAudioService,
                QaFileService,
                QaVideoService,
                QaJsonService,
                QaLinkService,
                QaWebviewService,
                QaReplyService,
                QaTextIndependentService,
                QaPlayService,
                QaQuoteService,
                QaEditorService,
                SmartQaEditorService,
            ],
        };
    }
}
