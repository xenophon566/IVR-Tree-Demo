import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NEBULAR_CHILD, NEBULAR_ALL } from "@define/nebular/nebular.module";
import { COMPONENTS } from "./components.define";

@NgModule({
    declarations: [...COMPONENTS],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ...NEBULAR_CHILD, ...NEBULAR_ALL],
    providers: [],
    exports: [...COMPONENTS],
    entryComponents: [...COMPONENTS],
})
export class SharedModule {}
