import {Directive, ElementRef, HostListener, NgModule} from "@angular/core";

/**
 * This directive removes focus from the selectors after clicking on them
 */
@Directive({
    selector: '[focusRemover]', // your selectors here!
})
export class FocusRemoverDirective {
    constructor(private elRef: ElementRef) {}

    @HostListener('click') onClick() {
        this.elRef.nativeElement.blur();
    }
}

@NgModule({
    imports: [],
    exports: [FocusRemoverDirective],
    declarations: [FocusRemoverDirective]
})
export class GsFocusRemoverModule { }