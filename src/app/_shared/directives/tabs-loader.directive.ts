import { Directive, ViewContainerRef } from '@angular/core';

/**
 * Tabs Loader Directive
 *
 * @export
 * @class TabsLoaderDirective
 */
@Directive({
    selector: '[cbeSharedTabsLoader]',
})
export class TabsLoaderDirective {
    /**
     * @ignore
     */
    constructor(public viewContainerRef: ViewContainerRef) {}
}
