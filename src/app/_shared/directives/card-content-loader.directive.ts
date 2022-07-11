import { Directive, ViewContainerRef } from "@angular/core";

/**
 * Card Content Loader Directive
 *
 * @export
 * @class CardContentLoaderDirective
 */
@Directive({
    selector: "[cbeSharedCardContentLoader]",
})
export class CardContentLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}
