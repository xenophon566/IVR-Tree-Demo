import { Directive, ViewContainerRef } from "@angular/core";

/**
 * Component Loader Directive
 *
 * @export
 * @class ComponentLoaderDirective
 */
@Directive({
    selector: "[cbeSharedComponentLoader]",
})
export class ComponentLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}
