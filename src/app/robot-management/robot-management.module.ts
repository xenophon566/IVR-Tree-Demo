import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RobotRoutingModule } from "./robot-management-routing.module";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { SharedModule } from "@shared/shared.module";
import { NEBULAR_CHILD, NEBULAR_ALL } from "@define/nebular/nebular.module";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IcrFlowComponent } from "./icr-flow/icr-flow.component";
import { GojsIvrComponent } from "./icr-flow/gojs-ivr/gojs-ivr.component";

/**
 * Robot Module
 *
 * @export
 * @class RobotModule
 */
@NgModule({
    declarations: [IcrFlowComponent, GojsIvrComponent],
    imports: [
        MatButtonToggleModule,
        CommonModule,
        RobotRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        NbEvaIconsModule,

        SharedModule,
        ...NEBULAR_CHILD,
        ...NEBULAR_ALL,
    ],
})
export class RobotManagementModule {}
