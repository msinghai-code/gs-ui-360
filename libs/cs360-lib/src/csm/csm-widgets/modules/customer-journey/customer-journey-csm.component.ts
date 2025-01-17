import { Component, Inject, OnInit } from '@angular/core';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Constants as TimelineConstants } from "../../../csm-sections/modules/csm-timeline/csm-timeline.constants"
import { EnvironmentService } from '@gs/gdk/services/environment';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';

@Component({
  selector: 'gs-customer-journey-csm',
  templateUrl: './customer-journey-csm.component.html',
  styleUrls: ['./customer-journey-csm.component.scss']
})
export class CustomerJourneyCsmComponent implements OnInit {

  widgetItem: any;
  isLoading: boolean = true;
  elementTag = 'gs-customer-journey-graph';
  url: string;
  moduleConfig;
  isPreviewSection: boolean = false;

  constructor(
      @Inject("envService") public env: EnvironmentService,
    public csmSummaryService: CsmSummaryService,
    @Inject(CONTEXT_INFO) public ctx,
  ) {
  }

  async ngOnInit() {
    this.isPreview();
    this.buildOptions();
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['timeline-customerjourney'] : (await getCdnPath('timeline-customerjourney'));
    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
    this.isLoading = false;
  }


  isPreview(){
    if(this.csmSummaryService.isPreviewMode){
      this.isPreviewSection = true;
    }
  }

  protected getTimelineRenderConfig() {
    const isR360 = (this.ctx.pageContext) === TimelineConstants.R360 ? true : false;
    const contexts = [
      {
        id: this.ctx.cId,
        obj: TimelineConstants.COMPANY,
        eobj: TimelineConstants.ACCOUNT,
        eid: null,
        esys: TimelineConstants.SFDC,
        lbl: this.ctx.companyName,
        dsp: true,
        base: !isR360
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
      meta: {
        contexts: contexts,
        viewContext: {
          id: isR360 ? this.ctx.rId : this.ctx.cId,
          obj: isR360 ? TimelineConstants.RELATIONSHIP : TimelineConstants.COMPANY,
          sys: TimelineConstants.GAINSIGHT,
          pageContext: this.ctx.pageContext,
          appVariant: this.ctx.appVariant
        },
        source: TimelineConstants.SUMMARY_WIDGET,
        formContext: {
          name: isR360 ? TimelineConstants.RELATIONSHIPTYPE : TimelineConstants.COMPANY,
          id: () => isR360 ? this.ctx.relationshipTypeId : this.ctx.cId
        }
      }
    }; 
  }

  buildOptions() {
    this.moduleConfig = this.getTimelineRenderConfig();
  }

}
