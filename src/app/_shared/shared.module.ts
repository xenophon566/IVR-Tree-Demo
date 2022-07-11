import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NEBULAR_CHILD, NEBULAR_ALL } from "@define/nebular/nebular.module";
import { COMPONENTS } from "./components.define";

import { QaEditorComponent } from "./components/qa-editor/qa-editor.component";
import { TextareaLoaderDirective } from "./directives/textarea-loader.directive";
import { CardContentLoaderDirective } from "./directives/card-content-loader.directive";
import { ReplyContentLoaderDirective } from "./directives/reply-content-loader.directive";
import { ComponentLoaderDirective } from "@shared/directives/component-loader.directive";
import { FormValidatorDirective } from "./directives/form-validator.directive";
import {
    QaEditorLoaderDirective,
    QaReplyLoaderDirective,
    QaWebviewLoaderDirective,
} from "@shared/directives/qa-editor-loader.directive";

@NgModule({
    declarations: [
        ...COMPONENTS,
        QaEditorComponent,
        TextareaLoaderDirective,
        CardContentLoaderDirective,
        ReplyContentLoaderDirective,
        ComponentLoaderDirective,
        FormValidatorDirective,
        QaEditorLoaderDirective,
        QaReplyLoaderDirective,
        QaWebviewLoaderDirective,
    ],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ...NEBULAR_CHILD, ...NEBULAR_ALL],
    providers: [],
    exports: [...COMPONENTS, QaEditorLoaderDirective, QaReplyLoaderDirective, QaWebviewLoaderDirective],
    entryComponents: [...COMPONENTS, QaEditorComponent],
})
export class SharedModule {}
