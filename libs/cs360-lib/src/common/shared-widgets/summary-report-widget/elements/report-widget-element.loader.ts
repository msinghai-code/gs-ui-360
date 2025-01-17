/**
 * created by rpal
 */
import {
    Component,
    Inject,
    ViewChild,
    Directive,
    ViewContainerRef,
    Input,
    OnInit,
    OnDestroy
} from "@angular/core";
import { BaseSectionComponent } from './../../../section/base-section/base-section.component';
import { ReportFilter } from "@gs/report/pojos";
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from "@gs/gdk/services/environment";

@Directive({
    selector: '[reportWidgetHost]'
})
export class ReportWidgetElementDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    template: `
        <ng-container *ngIf="load">
            <ax-lazy-element #report_widget
                             [properties]="properties"
                             [id]="id"
                             [cs360Filters]="cs360Filters"
                             [showActionColumn]="showActionColumn"
                             [showAddRecordButton]="showAddRecordButton"
                             [includeId]="includeId"
                             [dataFromChildrenOptions]="dataFromChildrenOptions"
                             [disableFilterModification]="disableFilterModification"
                             [honorPadding]="honorPadding"
                             [kpiCardViewEnabled]="kpiCardViewEnabled"
                             [useCache]="useCache"
                             [widgetElement]="sectionElement"
                             [extraQueryParams]="extraQueryParams"
                             (changes)="onAction($event)"
                             *axLazyElementDynamic="elementTag,url:url; loadingTemplate: loading; errorTemplate: error">
            </ax-lazy-element>
            <ng-template #loading>
                <div class="rw-element-loader" style="height: 100%;" gsSpinner [show]="true"></div>
            </ng-template>
            <ng-template #error>
                <nz-result nzStatus="warning"
                           nzTitle="Something went wrong!!!"
                           nzSubTitle="There was a problem in loading this widget. Try again or reach out to Gainsight support if the problem persists."></nz-result>
            </ng-template>
        </ng-container>`
})
export class ReportWidgetCs360ElementLoader extends BaseSectionComponent implements OnInit, OnDestroy {

    @Input() id: string; // id of the report widget.

    @Input() cs360Filters: { whereAdvanceFilter: ReportFilter, havingAdvanceFilter?: ReportFilter };

    @Input() showActionColumn: boolean;

    @Input() showAddRecordButton: boolean;

    @Input() includeId: boolean;

    @Input() dataFromChildrenOptions: any;

    @Input() disableFilterModification: boolean;

    @Input() honorPadding: boolean = true;

    @Input() kpiCardViewEnabled: any;

    @Input() useCache: boolean = true;

    @Input() extraQueryParams : any;

    @ViewChild('report_widget', {static: false}) reportWidget;

    url;
    elementTag = 'gs-report-widget-element';
    load = false;
    constructor(@Inject("envService") public env: EnvironmentService) {
        super();
    }

    async ngOnInit() {
        super.ngOnInit();
        // this.url = 'https://localhost:4201/main.js';
        /**
         * SFDC => this.cdnService.getCdnPath('report-widget')
         * Native => this.env.getGS().autonomousUrls['report-widget']
         */
        const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['report-widget'] : (await getCdnPath('report-widget'));
        if (moduleUrl) {
            this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
        } else {
            //Just For Local
            this.url = (this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['report-widget-local'] : "https://localhost:4201")+'/main.js';
        }
        this.load = true;
    }

    ngAfterViewInit() {
        console.log('');
    }

    getSourceDetails(): any {
        return this.reportWidget.nativeElement.getSourceDetails();
    }

    isFilterable(): boolean {
        return this.reportWidget.nativeElement.isFilterable();
    }

    onFilterUpdate(globalFilters?: any): void {
        this.reportWidget.nativeElement.onFilterUpdate(globalFilters);
    }

    getPropertiesToPersist(): any {
        return this.reportWidget.nativeElement.getPropertiesToPersist();
    }

    onResize() {
        this.reportWidget.nativeElement.onResize();
    }

    getChangesToBePreserved() {
        return this.reportWidget.nativeElement.getChangesToBePreserved();
    }

    preserveState() {
        return this.reportWidget.nativeElement.preserveState();
    }

    refreshData() {
        return this.reportWidget.nativeElement.refreshData();
    }

    onAction(event: any) {
        this.changes.emit(event.detail);
    }

    ngOnDestroy() { }
}
