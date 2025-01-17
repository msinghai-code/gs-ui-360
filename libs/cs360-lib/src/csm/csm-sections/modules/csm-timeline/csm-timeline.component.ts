import { Component, Inject, OnInit } from '@angular/core';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {Constants as TimelineConstants} from "./csm-timeline.constants";
import { combineLatest} from "rxjs";
import { EnvironmentService } from '@gs/gdk/services/environment';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { GSEvents, GSEventBusService } from "@gs/gdk/core";  //need to add constants in gdk
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';

@Component({
  selector: 'gs-csm-timeline',
  templateUrl: './csm-timeline.component.html',
  styleUrls: ['./csm-timeline.component.scss']
})
export class CsmTimelineComponent implements OnInit {
  elementTag = 'gs-timeline-ngx-widget-element';
    url: string;
    urlt = 'https://localhost:4201/main.js';
  moduleConfig;

  constructor(
      @Inject("envService") public env: EnvironmentService,
    @Inject(CONTEXT_INFO) public ctx,
	private eventService: GSEventBusService
	) {
  }

    protected async getTimelineRenderConfig() {
        let context;
        const isZoom = this.ctx.zoomPlatformData && Object.keys(this.ctx.zoomPlatformData).length > 0;
        if (isZoom) {
            combineLatest([this.ctx.zoomPlatformData.selectedContext$, this.ctx.zoomPlatformData.zoomContext$])
                .subscribe((result: any) => {
                    context = {
                        users: result[0].context.users,
                        attendees: result[1].currentMeetingAttendees
                    }
                })
        }
        const isR360 = (this.ctx.pageContext) === TimelineConstants.R360;
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
        let newContext: any = {
            meta: {
                contexts: contexts,
                viewContext: {
                    id: isR360 ? this.ctx.rId : this.ctx.cId,
                    obj: isR360 ? TimelineConstants.RELATIONSHIP : TimelineConstants.COMPANY,
                    sys: TimelineConstants.GAINSIGHT,
                    pageContext: this.ctx.pageContext,
                    appVariant: this.ctx.appVariant
                },
                source: isZoom ? TimelineConstants.ZOOM : isR360 ? TimelineConstants.R360 : TimelineConstants.CS360,
                formContext: {
                    name: isR360 ? TimelineConstants.RELATIONSHIPTYPE : TimelineConstants.COMPANY,
                    id: () => isR360 ? this.ctx.relationshipTypeId : this.ctx.cId
                },
                showLoadMoreBtn: JSON.parse(localStorage.getItem(`VERT_SCROLL_ENABLED_${this.ctx.pageContext}`))
            }
        };
        if(isZoom) {
            newContext = {
                ...newContext,
                defaultData: {
                    subject: this.ctx.zoomPlatformData.meetingTopic,
                    attendees: {
                        all: context.attendees,
                        users: context.users
                    }
                }
            }
        }
        return newContext;
    }

  async buildOptions() {
    this.moduleConfig= await this.getTimelineRenderConfig();
  }
  

  async ngOnInit() {

      this.urlt = 'https://localhost:4201/main.js';
      await this.buildOptions();
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['timeline-ngx-widget'] : (await getCdnPath('timeline-ngx-widget'));
    this.url = "https://localhost:4201/main.js";
   // this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
    
  }

  onActivitySave($event) {
	const payload = {
		type: GSEvents.ACTIVITYSAVED,
		sourceId:  GSEvents.ACTIVITYSAVED,
		payload: $event.detail
	  };
	this.eventService.emit(payload);
  }

}
