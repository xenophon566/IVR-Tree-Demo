import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const ROBOT_ROUTES: Routes = [];

/**
 * Robot Routing Module
 *
 * @export
 * @class RobotRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(ROBOT_ROUTES)],
    exports: [RouterModule],
})
export class RobotRoutingModule {}
