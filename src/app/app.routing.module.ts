import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./home/home.component";
import { DemoButtonsComponent } from "./demo-buttons/demo-buttons.component";
import { DemoFirebaseComponent } from "./demo-firebase/demo-firebase.component";
import { SmartQaEditorComponent } from "./smart-qa-editor/smart-qa-editor.component";
import { IcrFlowComponent } from "./robot-management/icr-flow/icr-flow.component";

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: "home",
                component: HomeComponent,
                children: [
                    {
                        path: "robot-management",
                        loadChildren: () =>
                            import("./robot-management/robot-management.module").then((m) => m.RobotManagementModule),
                    },
                ],
            },
            { path: "demo-buttons", component: DemoButtonsComponent },
            { path: "demo-firebase", component: DemoFirebaseComponent },
            {
                path: "smartQaEditor",
                component: SmartQaEditorComponent,
            },
            {
                path: "icrFlow",
                component: IcrFlowComponent,
            },
            { path: "", component: HomeComponent },
            { path: "**", redirectTo: "home" },
        ]),
    ],
    exports: [RouterModule],
    providers: [],
})
export class AppRoutingModule {}
