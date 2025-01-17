import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {Component, Inject, ViewChild} from "@angular/core";
import { BaseSectionComponent } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";


// export class ReportWidgetProvider extends AbstractWidgetProvider{
//     constructor() { super();}
//     public static async getWidgetView(context: IDashboardContext) {
//         const ReportWidgetModule = (await import("@gs/report-widget-lib/src/report-widget.module"));
//         if(context.loadWidgetData){
//             return ReportWidgetModule.ReportWidgetModule.getReportWidgetComponent();
//         }else {
//             return ReportWidgetModule.ReportWidgetModule.getLightWeightReportWidgetComponent();
//         }
//     }
// }

// @dynamic
export class SampleSectionProvider extends AbstractSectionProvider {

    constructor() { super();}

    public static async getSectionView(context: any) {
        // TODO: To be changed to only one class reference to handle separation of concerns
        return new Promise((resolve) => resolve(1))
    }

    static getBundleInformation(autonomousUrls: {[key:string]:string }) {
        const url = autonomousUrls['report-widget'] || "https://google.com"; //Point to local host if required
        return {
            url: url + '/main-es2015.js',
            customElementTag: 'gs-report-widget-element',
            type: 'report'
        }
    }

}

// @Component({
//     template: `      
//         <ng-container *ngIf="load">
//             <ax-lazy-element #report_widget
//                     [properties]="properties"
//                     [id]="'a29d15ae-ffcb-494d-8567-c35159d1413e'"
//                     [widgetElement]="sectionElement"
//                     (changes)="changes.emit($event.detail)"
//                 *axLazyElementDynamic="elementTag,url:url">
//             </ax-lazy-element>
//         </ng-container>`
// })
// export class ReportWidgetComponent extends BaseSectionComponent {
//     url;
//     elementTag = 'gs-report-widget-element-dashboard';
//     load = false;
//     @ViewChild('report_widget', {static: false}) reportWidget;
//     constructor(@Inject("envService") public env: EnvironmentService) {
//         super();
//     }
//     async ngOnInit() {
//         super.ngOnInit();
//         this.url = 'https://localhost:4201/main.js';
//         this.properties = {
//             "id": 3395,
//             "name": "ARR (1)",
//             "referenceId": "a29d15ae-ffcb-494d-8567-c35159d1413e",
//             "assetType": "GS_REPORTS",
//             "sourceType": "NEW-STACK",
//             "customProperties": {
//             },
//             "executable": true,
//             "context": {
//                 "loadWidgetData": true,
//                 "requestSource": "GS_HOME_BUILDER"
//             }
//         }
//         /**
//          * SFDC => getCdnPath('report-widget')
//          * Native => this.env.getGS().autonomousUrls['report-widget']
//          */
//         //const moduleUrl = ""// "https://staticjs.develgs.com/report-widget/GS-UI-REPORTING-21Feb-H8.1"; // this.env.getGS().autonomousUrls ? this.env.getGS().autonomousUrls['report-widget'] : (getCdnPath('report-widget'));
//         //this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER? 'main-es2015.js':'main-es5.js'}`; //Point to local host if required
//         this.load = true;
//     }

//     ngAfterViewInit() {
//         console.log('');
//     }

//     getSourceDetails(): any {
//         return this.reportWidget.nativeElement.getSourceDetails();
//     }

//     isFilterable(): boolean {
//         return this.reportWidget.nativeElement.isFilterable();
//     }

//     onFilterUpdate(globalFilters?: any): void {
//         this.reportWidget.nativeElement.onFilterUpdate(globalFilters);
//     }

//     getPropertiesToPersist(): any {
//         return this.reportWidget.nativeElement.getPropertiesToPersist();
//     }

//     onResize() {
//         this.reportWidget.nativeElement.onResize();
//     }

//     getChangesToBePreserved() {
//         return this.reportWidget.nativeElement.getChangesToBePreserved();
//     }

//     preserveState() {
//         return this.reportWidget.nativeElement.preserveState();
//     }
// }
