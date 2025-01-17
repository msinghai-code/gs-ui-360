import {Component, Inject, OnInit} from '@angular/core';
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";
import {CsmWidgetBaseComponent} from "../modules/csm-widget-base/csm-widget-base.component";
import {CsmSummaryService} from "../../csm-sections/modules/csm-summary/csm-summary.service";
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {Constants as TimelineConstants} from "../../csm-sections/modules/csm-timeline/csm-timeline.constants"
import { EnvironmentService } from '@gs/gdk/services/environment';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';

// @dynamic
export class CSMTimelineWidgetProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView(c) {
        return new Promise( resolve => resolve(TimelineWidgetLoaderComponent));
    }
}

@Component({
    template:` <ng-template #loading>
        <div class="ph-item pre-resource-loader">
            <div class="ph-col-12">
                <div class="ph-row">
                    <div class="ph-col-12 big"></div>
                </div>
            </div>
        </div>
    </ng-template>
    <ng-template #error>
        <div class="widget-not-available">
            <div>There was a problem in loading this widget. Try again or reach out to Gainsight support if the problem persists.</div>
        </div>
    </ng-template>
    <ax-lazy-element #timeline_widget
                     [timelineSummaryWidgetProperties]="widgetItem"
                     [options]="moduleConfig"
                     *axLazyElementDynamic="elementTag,
                     url:url; loadingTemplate:loading; errorTemplate: error">
    </ax-lazy-element>`,
})

export class TimelineWidgetLoaderComponent  extends CsmWidgetBaseComponent implements OnInit {
    url;
    load = false;
    moduleConfig;
    elementTag = 'gs-timeline-ngx-widget-element';

    constructor(public csmSummaryService: CsmSummaryService,
                @Inject(CONTEXT_INFO) public ctx,
                @Inject("envService") public env: EnvironmentService) {
        super(csmSummaryService, ctx);
    }

   async ngOnInit(){
       super.ngOnInit();
       this.buildOptions();
       const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['timeline-ngx-widget'] : (await getCdnPath('timeline-ngx-widget'));
        this.url = `${moduleUrl || "https://localhost:4200"}/${IS_LEGACY_BROWSER? 'main-es5.js':'main-es2015.js'}`; //Point to local host if required
    //    this.url = 'https://localhost:4200/main.js';
       this.load = true;
    }

    protected getTimelineRenderConfig() {
        const isR360=(this.ctx.pageContext)===TimelineConstants.R360?true:false;
		const contexts = [
			{
				id: this.ctx.cId,
				obj: TimelineConstants.COMPANY,
				eobj: TimelineConstants.ACCOUNT,
				eid: null,
				esys: TimelineConstants.SFDC,
				lbl: this.ctx.companyName,
				dsp: true,
                base:!isR360
			}
		];
		if (isR360) {
			contexts.push({
					id: this.ctx.relationshipTypeId,
					obj: TimelineConstants.RELATIONSHIPTYPE,
					eobj: TimelineConstants.RELATIONSHIPTYPE,
					eid: null,
					esys: TimelineConstants.SFDC,
					lbl: null,
					dsp: false,
					base: false
				},
				{
					id: this.ctx.rId,
					obj: TimelineConstants.RELATIONSHIP,
					eobj: TimelineConstants.RELATIONSHIP,
					eid: null,
					esys: TimelineConstants.SFDC,
					lbl: this.ctx.relationshipName,
					dsp: true,
					base: true
				});
		}
		return {
            meta:{
                contexts: contexts,
                viewContext: {
                id: isR360? this.ctx.rId : this.ctx.cId,
                obj: isR360? TimelineConstants.RELATIONSHIP : TimelineConstants.COMPANY,
                sys: TimelineConstants.GAINSIGHT
                },
                source: TimelineConstants.SUMMARY_WIDGET,
                formContext: {
                name: isR360? TimelineConstants.RELATIONSHIPTYPE : TimelineConstants.COMPANY,
                id: () => isR360? this.ctx.relationshipTypeId: this.ctx.cId
                }
            }
		};
    }
    
    buildOptions(){
        this.moduleConfig=this.getTimelineRenderConfig();
    }


}
