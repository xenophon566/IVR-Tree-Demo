import { Directive, ViewContainerRef } from "@angular/core";

/**
 * QaEditor Loader Directive
 *
 * @export
 * @class QaEditorLoaderDirective
 */
@Directive({
    selector: "[cbeSharedQaEditorLoader]",
})
export class QaEditorLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}

/**
 * QaReply Loader Directive
 *
 * @export
 * @class QaReplyLoaderDirective
 */
@Directive({
    selector: "[cbeSharedQaReplyLoader]",
})
export class QaReplyLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}

/**
 * QaWebview Loader Directive
 *
 * @export
 * @class QaWebviewLoaderDirective
 */
@Directive({
    selector: "[cbeSharedQaWebviewLoader]",
})
export class QaWebviewLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}
