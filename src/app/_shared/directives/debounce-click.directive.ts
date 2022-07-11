import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

/**
 * Debounce Click Directive
 *
 * @export
 * @class DebounceClickDirective
 */
@Directive({
    selector: "[cbeDebounceClick]",
})
export class DebounceClickDirective {
    constructor() {}

    /**
     * debounceTime
     *
     * @memberof DebounceClickDirective
     */
    @Input() debounceTime = 1000;

    /**
     * debounceClick
     *
     * @memberof DebounceClickDirective
     */
    @Output() debounceClick = new EventEmitter();

    /**
     * clicks
     *
     * @private
     * @memberof DebounceClickDirective
     */
    private clicks = new Subject();

    /**
     * subscription
     *
     * @private
     * @type {Subscription}
     * @memberof DebounceClickDirective
     */
    private subscription: Subscription;

    ngOnInit() {
        this.subscription = this.clicks
            .pipe(debounceTime(this.debounceTime))
            .subscribe((e) => this.debounceClick.emit(e));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    /**
     * HostListener clickEvent
     *
     * @param {*} $event
     * @memberof DebounceClickDirective
     */
    @HostListener("click", ["$event"])
    clickEvent($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.clicks.next($event);

        document.body.click();
    }
}
