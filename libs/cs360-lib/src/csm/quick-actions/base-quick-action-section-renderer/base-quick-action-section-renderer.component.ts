import {Component, Inject, Input, OnInit} from '@angular/core';

import {CONTEXT_INFO, ICONTEXT_INFO, RegistrationService, RENDER_TYPES} from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
@Component({
  selector: 'gs-360-quick-action',
  templateUrl: './base-quick-action-section-renderer.component.html',
  styleUrls: ['./base-quick-action-section-renderer.component.scss']
})
export class BaseQuickActionSectionRendererComponent implements OnInit {
  elementTag = '';
  url: string;
  section = null;
  renderContext: ICONTEXT_INFO;
  @Input() context; //quick action context
  constructor(
      @Inject(CONTEXT_INFO) public ctx,
      @Inject("envService") public env: EnvironmentService,
      private rs: RegistrationService
  ) {}

  ngOnInit() {
    const section = this.env.moduleConfig.sections.filter((section)=>section.sectionType === this.context.type);
    if(section && section.length){
      this.section = section[0].config ? section[0] : null;
    }
    this.elementTag = this.rs.getElementTag("QUICK_ACTIONS",this.ctx.pageContext,this.context.type,this.ctx.consumptionArea,this.ctx.appVariant);
    this.url = this.rs.getModuleUrl("QUICK_ACTIONS",this.ctx.pageContext,this.context.type,this.ctx.consumptionArea,this.ctx.appVariant);
    this.renderContext = {...this.ctx, customProperties:{
        ...this.ctx.customProperties,
        type: RENDER_TYPES.QUICK_ACTIONS
      }
    };
  }

}
