import {Component, Inject, Input, OnInit} from '@angular/core';

import {
  CONTEXT_INFO,
  CS360CacheService,
  ICONTEXT_INFO,
  RegistrationService,
  RENDER_TYPES
} from '@gs/cs360-lib/src/common';
@Component({
  selector: 'gs-360-csm-widget',
  templateUrl: './base-csm-widget-renderer.component.html',
  styleUrls: ['./base-csm-widget-renderer.component.scss']
})
export class BaseCsmWidgetRendererComponent implements OnInit {
  elementTag = '';
  url: string;
  renderContext: ICONTEXT_INFO;
  @Input() widgetItem;
  @Input() moduleConfig;
  constructor(
      @Inject(CONTEXT_INFO) public ctx,
      private cs360CacheService: CS360CacheService,
      private rs: RegistrationService
  ) {}

  ngOnInit() {
    this.elementTag = this.rs.getElementTag("WIDGET",this.ctx.pageContext,this.widgetItem.widgetType);
    this.url = this.rs.getModuleUrl("WIDGET",this.ctx.pageContext,this.widgetItem.widgetType);
    this.renderContext = {...this.ctx, customProperties:{
        ...this.ctx.customProperties,
        type: RENDER_TYPES.WIDGET
      }
    };
  }

  navigateToSection(event) {
    if(event && event.detail && event.detail.sectionType){
      this.cs360CacheService.navigateToSection(event.detail.sectionType, event.detail.data || {},this.moduleConfig);
    }
  }
}
