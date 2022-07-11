import { Directive, ViewContainerRef } from "@angular/core";

/**
 * Reply Content Loader Directive
 *
 * @export
 * @class ReplyContentLoaderDirective
 */
@Directive({
    selector: "[cbeSharedReplyContentLoader]",
})
export class ReplyContentLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}
