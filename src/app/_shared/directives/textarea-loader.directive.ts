import { Directive, ViewContainerRef } from "@angular/core";

/**
 * Textarea Loader Directive
 *
 * @export
 * @class TextareaLoaderDirective
 */
@Directive({
    selector: "[cbeSharedTextareaLoader]",
})
export class TextareaLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}
