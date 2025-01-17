import { Component, Inject, Input, OnInit } from '@angular/core';
import {ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO, RegistrationService} from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-base-widget-renderer',
  templateUrl: './base-widget-renderer.component.html',
  styleUrls: ['./base-widget-renderer.component.scss']
})
export class BaseWidgetRendererComponent implements OnInit {
  @Input() widgetItem;
  @Input() type;
  
  elementTag: string;
  url: string;
  renderContext: IADMIN_CONTEXT_INFO;

  constructor(
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private rs: RegistrationService){
  }

  ngOnInit() {
    this.elementTag = this.rs.getElementTag("WIDGET_ADMIN",this.ctx.pageContext, this.widgetItem.subType);
    this.url = this.rs.getModuleUrl("WIDGET_ADMIN",this.ctx.pageContext,this.widgetItem.subType);
    this.renderContext = {...this.ctx, customProperties:{
      ...this.ctx.customProperties,
      type: this.type
    }
    };
  }
}
