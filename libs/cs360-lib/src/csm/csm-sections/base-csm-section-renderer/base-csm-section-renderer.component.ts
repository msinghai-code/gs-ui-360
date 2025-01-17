import {Component, Inject, Input, OnInit} from '@angular/core';

import {
  CONTEXT_INFO,
  CS360CacheService,
  ICONTEXT_INFO,
  RegistrationService,
  RENDER_TYPES
} from '@gs/cs360-lib/src/common';
@Component({
  selector: 'gs-360-csm',
  templateUrl: './base-csm-section-renderer.component.html',
  styleUrls: ['./base-csm-section-renderer.component.scss']
})
export class BaseCsmSectionRendererComponent implements OnInit {
  elementTag = '';
  url: string;
  renderContext: ICONTEXT_INFO;
  @Input() section;
  constructor(
      @Inject(CONTEXT_INFO) public ctx,
      private rs: RegistrationService,
      private cs360CacheService:CS360CacheService
  ) {}
  ngOnInit() {
    this.elementTag = this.rs.getElementTag("SECTION",this.ctx.pageContext,this.section.sectionType,this.ctx.consumptionArea,this.ctx.appVariant);
    this.url = this.rs.getModuleUrl("SECTION",this.ctx.pageContext,this.section.sectionType,this.ctx.consumptionArea,this.ctx.appVariant);
    this.renderContext = {...this.ctx, customProperties:{
        ...this.ctx.customProperties,
        type: RENDER_TYPES.SECTION
      }
    };
  }

  switchToAssociatedContextSection(event) {
    this.cs360CacheService.switchToAssociatedContext(event.detail.selectedContext || {}, event.detail.meta || {});
  }
}
