import { BaseSectionComponent } from '@gs/cs360-lib/src/common';
import { Component, Inject, OnInit } from '@angular/core';
import { PageContext } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';

import { EnvironmentService } from '@gs/gdk/services/environment';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';

import { combineLatest} from "rxjs";


@Component({
  selector: 'gs-csm-scorecard',
  templateUrl: './csm-scorecard.component.html',
  styleUrls: ['./csm-scorecard.component.scss']
})
export class CsmScorecardComponent extends BaseSectionComponent implements OnInit {

  elementTag = 'gs-scorecard-360';
  url: string;
  options:any = {};
  constructor(@Inject("envService") public env: EnvironmentService,  @Inject(CONTEXT_INFO) public ctx) {
    super()
  }

  async ngOnInit() {
    const moduleConfig = this.env.moduleConfig.layoutData.layoutResolverDTO;
    const relationshipTypeId = moduleConfig.relationshipTypeId;
    const relationshipId = moduleConfig.relationshipId;
    const companyId = moduleConfig.companyId;
    const layoutData = this.env.moduleConfig.layoutData.data;
    const companyName = layoutData["company_Name"];
    const relationshipName  = layoutData["relationship_Name"] || "";
    console.log("Module Config >>>>>>>>>>>>>>>>>>", moduleConfig);
      let context;
    const isZoom = Object.keys(this.ctx.zoomPlatformData || {}).length > 0;
    if(isZoom){  
     combineLatest([this.ctx.zoomPlatformData.selectedContext$, this.ctx.zoomPlatformData.zoomContext$])
        .subscribe((result: any) => {
          context = {
            users: result[0].context.users,
            attendees: result[1].currentMeetingAttendees
          }
        })
    }
    const options:any = {
      isNative : window["GS"].isNative,
      isFromCS360: this.ctx.pageContext === PageContext.C360 ? true : false,
      relationshipId,
      relationshipTypeId,
      isRelationship360:this.ctx.pageContext === PageContext.R360 ? true : false ,
      companyId,
      companyName,
      relationshipName,
      isReadOnlyApp:window["GS"].isReadOnlyApp,
      consumptionArea: this.ctx.consumptionArea,
      sectionTitle: this.section.label,
      appVariant: this.ctx.appVariant
    }
    if(isZoom){
      options.defaultData = {
        subject: this.ctx.zoomPlatformData.meetingTopic,
        attendees: {
          all: context.attendees,
          users: context.users
        }
      }
    }
    this.options = options;
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['scorecard-widgets'] : (await getCdnPath('scorecard-widgets'));
     this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
    // this.url = `https://localhost:4201/main.js`;
  }

}
