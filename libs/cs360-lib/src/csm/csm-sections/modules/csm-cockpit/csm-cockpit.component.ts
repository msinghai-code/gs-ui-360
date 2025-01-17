import { BaseSectionComponent } from '@gs/cs360-lib/src/common';
import { Component, Inject, OnInit } from '@angular/core';
import { SectionRendererService } from '@gs/cs360-lib/src/common';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { GSEventBusService, GSEvents } from "@gs/gdk/core";
import { EnvironmentService } from '@gs/gdk/services/environment';
import { ICONTEXT_INFO, CONTEXT_INFO, isMini360 } from '@gs/cs360-lib/src/common';
@Component({
  selector: 'gs-csm-cockpit',
  templateUrl: './csm-cockpit.component.html',
  styleUrls: ['./csm-cockpit.component.scss']
})
export class CsmCockpitComponent extends BaseSectionComponent implements OnInit {

  elementTag = isMini360(this.context) ? 'gs-cockpit-mini360-widget' : 'gs-cockpit-widget';
  url: string;

  constructor(@Inject("envService") public env: EnvironmentService,
  private sectionRendererService: SectionRendererService,
  private eventService: GSEventBusService,
  @Inject(CONTEXT_INFO) public context: ICONTEXT_INFO) {
    super()
  }

  async ngOnInit() {
    this.sectionRendererService.getQuickActionCreatedSubjectAsObservable().subscribe(actionContext => {
      this.properties = {
        ...this.properties,
        context: {
          ...this.properties.context, quickActionSaved: true
        }
      }
    })
    // refresh CTA list on activity save
    this.eventService.on(GSEvents.ACTIVITYSAVED, GSEvents.ACTIVITYSAVED, (payload) =>  {
      this.properties = {
        ...this.properties,
        context: {
          ...this.properties.context, quickActionSaved: true
        }
      }
    })
    this.properties = {
      widgetElement: this.sectionElement,
      context: {
        loadWidgetData: true
      },
      cockpitRenderContext: {
        context: this.context.pageContext,
        moduleCategory : 'CTA',
        entityType: this.env.moduleConfig.layoutData.layoutResolverDTO.entityType.toUpperCase(),
        entityId: this.env.moduleConfig.layoutData.layoutResolverDTO.relationshipTypeId,
        companyId: this.env.moduleConfig.layoutData.layoutResolverDTO.companyId,
        relationshipId: this.env.moduleConfig.layoutData.layoutResolverDTO.relationshipId,
        companyName: this.context.companyName,
        relationshipName: this.context.relationshipName,
        appVariant: this.context.appVariant
      }
    } 

    /**
     * SFDC => this.cdnService.getCdnPath('cockpit-widget'')
     * Native => this.env.getGS().autonomousUrls['cockpit-widget'']
     */
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['cockpit-widget'] : (await getCdnPath('cockpit-widget'));

    if(moduleUrl){
      let subFolder = 'c360';

      if(isMini360(this.context)) {
        subFolder = 'mini360';
      }
      
      this.url = `${moduleUrl}/${subFolder}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`
    }else{
      this.url = `https://localhost:4201/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`
    }
  }

  paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
      result[key.toUpperCase()] = value;
    }
    return result;
  }

}
