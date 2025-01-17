import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-quick-cta',
  templateUrl: './quick-cta.component.html',
  styleUrls: ['./quick-cta.component.scss']
})
export class QuickCtaComponent implements OnInit {

  elementTag = 'gs-create-cta-widget';
  url = "";
  properties = {};
  /* 
  When value is emiited from this, component will be removed
  */
  @Output() onAction = new EventEmitter();

  constructor(@Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO ,@Inject("envService") public env: EnvironmentService) { }

  async ngOnInit() {
    const moduleUrl = (await getCdnPath('cockpit-widgets'));
    this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    const isR360 = Cs360ContextUtils.isR360(this.ctx);
    this.properties = {
      // entityType: Cs360ContextUtils.getBaseObjectName(this.ctx).toUpperCase(),
      entityType: this.ctx.baseObject.toUpperCase(),
      entityId: isR360 ? this.ctx.relationshipTypeId: null,
      companyId : this.ctx.cId,
      relationshipId: isR360 ? this.ctx.rId : null,
      context : this.ctx.pageContext,
      companyName: this.ctx.companyName,
      relationshipName: this.ctx.relationshipName,
      appVariant: this.ctx.appVariant
    }
  }
  
  removeWidget(event) {
    if (event.detail.evt === "CTA_CREATED"){
      this.onAction.emit({type: "SAVE"});
    } else{
      this.onAction.emit({type: "CANCEL"});
    }
  }
}
