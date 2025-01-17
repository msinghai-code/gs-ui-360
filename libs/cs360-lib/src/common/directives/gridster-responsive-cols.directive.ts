import {Directive, ElementRef, EventEmitter, HostListener, Input, NgModule, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import { debounce } from 'lodash';

/**
 * This directive removes focus from the selectors after clicking on them
 */
@Directive({
    selector: '[gridsterResponsiveCols]', // your selectors here!
})
export class GridsterResponsiveColsDirective implements OnInit, OnChanges {
    
    @Input() options;
    @Input() minWidthOfCol = 180;
    @Input() maxCols = 20;
    @Output() colsChanged = new EventEmitter();
    currentCols;

    constructor(private elRef: ElementRef) {}

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.options && changes.options.firstChange) {
            console.log('Gridster Options Changed!', this.options);
            if(this.options) {
                this.options.mobileBreakpoint = 10;
            }
            this.calculateCols();
        }
    }

    @HostListener('window:resize', ['$event'])
    public onResize(event) {
        if (!event) {
            return;
        }

        this.debouncedCalculateCols();
    }

    private calculateCols() {
        const width = this.elRef.nativeElement.offsetWidth;
        // console.log('Calcualting cols... width:', width);
        const numOfCols = Math.min(Math.floor(width/this.minWidthOfCol), this.maxCols) || 1;
        
        if(numOfCols !== this.currentCols) {
            console.log('New Cols:', numOfCols);
            
            this.colsChanged.emit(numOfCols);
            this.currentCols = numOfCols;
        }
    }

    debouncedCalculateCols = debounce(this.calculateCols.bind(this), 1000);
}

@NgModule({
    imports: [],
    exports: [GridsterResponsiveColsDirective],
    declarations: [GridsterResponsiveColsDirective]
})
export class GsGridsterResponsiveColsModule { }