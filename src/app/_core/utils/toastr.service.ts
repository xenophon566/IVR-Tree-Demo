import { Injectable } from "@angular/core";

import { NbToastrService, NbGlobalPhysicalPosition } from "@nebular/theme";

/**
 * Toastr Service
 *
 * @export
 * @class ToastrService
 */
@Injectable({
    providedIn: "root",
})
export class ToastrService {
    /**
     * @ignore
     */
    constructor(private nbToastrService: NbToastrService) {}

    /**
     * show Toastr
     *
     * @param {*} args
     * @memberof ToastrService
     */
    showToastr(...args) {
        this.nbToastrService.show(args[0], args[1], {
            position: args[2].position || NbGlobalPhysicalPosition.BOTTOM_RIGHT,
            duration: args[2].duration || 5000,
            status: args[2].status || "basic",
            destroyByClick: args[2].destroyByClick || true,
            icon: args[2].icon || "checkmark-outline",
        });
    }
}
