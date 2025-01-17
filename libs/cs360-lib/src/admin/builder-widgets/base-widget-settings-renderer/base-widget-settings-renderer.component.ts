import {Component, Inject, Input, OnInit, ViewChild } from '@angular/core';

import {ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO, RegistrationService} from '@gs/cs360-lib/src/common';
import {BaseWidgetComponent} from "@gs/gdk/widget-viewer";

@Component({
  selector: 'gs-360-widget-settings',
  templateUrl: './base-widget-settings-renderer.component.html',
  styleUrls: ['./base-widget-settings-renderer.component.scss']
})
export class BaseWidgetSettingsRendererComponent extends BaseWidgetComponent implements OnInit {
  @Input() widgetItem;
  @Input() type;
  @ViewChild('widgetSettings', {static: false} ) widgetSettings: any;
  
  elementTag: string;
  url: string;
  renderContext: IADMIN_CONTEXT_INFO;

  constructor(
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private rs: RegistrationService){
    super();
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

  toJSON() {
    return this.widgetSettings.nativeElement.toJSON();
  }

  isValid() {
    return this.widgetSettings.nativeElement.validate() || true;
  }
}
