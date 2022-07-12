import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NEBULAR_CHILD, NEBULAR_ALL } from "@define/nebular/nebular.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { COMPONENTS } from "./components.define";
import { QaEditorComponent } from "./components/qa-editor/qa-editor.component";
import { TextareaLoaderDirective } from "./directives/textarea-loader.directive";
import { CardContentLoaderDirective } from "./directives/card-content-loader.directive";
import { ReplyContentLoaderDirective } from "./directives/reply-content-loader.directive";
import { ComponentLoaderDirective } from "@shared/directives/component-loader.directive";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { AngularCropperjsModule } from "angular-cropperjs";
import { ImageCropperModule } from "ngx-image-cropper";
import { SortTableComponent } from "./components/table/sort-table/sort-table.component";
import { PaginationComponent } from "./components/pagination/pagination.component";
import { FormValidatorDirective } from "./directives/form-validator.directive";
import { QaTextIndependentComponent } from "./components/qa-text-independent/qa-text-independent.component";
import {
    QaEditorLoaderDirective,
    QaReplyLoaderDirective,
    QaWebviewLoaderDirective,
} from "@shared/directives/qa-editor-loader.directive";
import { DataTableComponent } from "./components/table/data-table/data-table.component";
import { TemplateDialogComponent } from "./components/dialog/template-dialog/template-dialog.component";
import { QaPlayComponent } from "./components/qa-play/qa-play.component";
import { SeparatorPipe } from "./pipes/separator.pipe";
import { SafePipe } from "./pipes/safe.pipe";

import { DragDropModule } from "@angular/cdk/drag-drop";

import { MatTableModule } from "@angular/material/table";
import { DragTableComponent } from "./components/table/drag-table/drag-table.component";
import { QaQuoteComponent } from "./components/qa-quote/qa-quote.component";
import { HtmlDialogComponent } from "./components/dialog/html-dialog/html-dialog.component";
import { OauthSettingDialogComponent } from "./components/dialog/oauth-setting-dialog/oauth-setting-dialog.component";

/**
 * Create Translate Loader
 *
 * @export
 * @param {HttpClient} http
 * @returns
 */
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "../../assets/i18n/", ".json");
}
/**
 * Shared Module
 *
 * @export
 * @class SharedModule
 */
@NgModule({
    declarations: [
        ...COMPONENTS,
        QaEditorComponent,
        TextareaLoaderDirective,
        CardContentLoaderDirective,
        ReplyContentLoaderDirective,
        ComponentLoaderDirective,
        SortTableComponent,
        PaginationComponent,
        FormValidatorDirective,
        QaTextIndependentComponent,
        QaEditorLoaderDirective,
        QaReplyLoaderDirective,
        QaWebviewLoaderDirective,
        DataTableComponent,
        TemplateDialogComponent,
        QaPlayComponent,
        SeparatorPipe,
        SafePipe,
        DragTableComponent,
        QaQuoteComponent,
        HtmlDialogComponent,
        OauthSettingDialogComponent,
    ],
    imports: [
        MatTableModule,
        DragDropModule,
        ReactiveFormsModule,
        CommonModule,
        AngularCropperjsModule,
        ImageCropperModule,
        FormsModule,
        NgSelectModule,
        HttpClientModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
            isolate: true,
        }),
        ...NEBULAR_CHILD,
        ...NEBULAR_ALL,
    ],
    providers: [SeparatorPipe],
    exports: [
        ...COMPONENTS,
        SeparatorPipe,
        SafePipe,
        QaEditorLoaderDirective,
        QaReplyLoaderDirective,
        QaWebviewLoaderDirective,
    ],
    entryComponents: [...COMPONENTS, QaEditorComponent],
})
export class SharedModule {}
