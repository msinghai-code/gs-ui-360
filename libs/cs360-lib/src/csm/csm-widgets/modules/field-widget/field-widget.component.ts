import { Component, Inject, Input, OnInit } from '@angular/core';
import { CONTEXT_INFO, isMini360 } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
import { Router } from '@angular/router';
import { merge } from 'lodash';
import { CS360CacheService } from '@gs/cs360-lib/src/common';
import { PxService } from '@gs/cs360-lib/src/common';
import { PX_CUSTOM_EVENTS, WidgetTypes } from '@gs/cs360-lib/src/common';
import { CSMAttributeService } from "../../../csm-sections/modules/csm-attribute/csm-attribute.service";
import { LOADER_TYPE } from '@gs/gdk/spinner';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { unescape } from 'lodash';
import { formatUrlToLink }  from "../../../../../src/common/cs360.utils";

@Component({
  selector: 'gs-field-widget',
  templateUrl: './field-widget.component.html',
  styleUrls: ['./field-widget.component.scss']
})
export class FieldWidgetComponent extends CsmWidgetBaseComponent implements OnInit {
  @Input() nzEllipsisRows;
  isTooltipVisible = false; 
  constructor(csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx, @Inject("envService") private _env: EnvironmentService, private router: Router, private cs360CacheService: CS360CacheService, public pxService: PxService, public attrService: CSMAttributeService) {
    super(csmSummaryService, ctx);
  }

  loaderOptions = {
    loaderType: LOADER_TYPE.SVG,
    loaderParams: {
      svg_url_class: 'gs-loader-vertical-bar-skeleton',
      svg_wrapper_class: 'gs-loader-vertical-bar-skeleton-wrapper-opacity'
    }
};

  dataLoaded() {
    if(this.widgetItem.dataType === 'BOOLEAN' && !this.data.fv)
    {
      // this sets the boolean default to false
      this.data.fv = false;
    }
    this.widgetItem.value = this.data;
    merge(this.widgetItem, this.widgetItem.config);
    this.widgetItem.isEditing = false;
    console.log('field widget', this.attrService.treeData)
  }

  onUpdate(event) {
    if (event.type === 'SAVE') {
      const source = this.widgetItem.dataType === WidgetTypes.RICHTEXTAREA ? WidgetTypes.RICHTEXTAREA_EDIT : WidgetTypes.FIELD_WIDGET;
      this.pxService.pxAptrinsic(PX_CUSTOM_EVENTS.DATA_EDIT, {Source: source});
      if(this.ctx.associatedObjects && this.ctx.associatedObjects.length && this.widgetItem.dataType === WidgetTypes.RICHTEXTAREA){
        event['multiAttributeData'] = this.csmSummaryService.getMultiAttributeWidgetPayload({...event,item: this.widgetItem.config});
      }
      this.csmSummaryService.saveAttribute(event.payload, event.entityId, event.entityType, event.dataEditEntityId,event.multiAttributeData);
    }
  }

  navigateToRoute(event) {
    if (!(['.field-edit-hover', '.gs-form'].some(selector => event.target.closest(selector)) || this.widgetItem.editable)) {
      this.pxService.pxAptrinsic(PX_CUSTOM_EVENTS.WIDGET_REDIRECTION, {Source: WidgetTypes.FIELD_WIDGET});
      const navigationConfig = this.widgetItem && this.widgetItem.properties && this.widgetItem.properties.navigationConfig || null;
      if(navigationConfig &&  navigationConfig !== "NONE") {
        if(!isMini360(this.ctx)) {
          this.router.navigate([`/${navigationConfig}`]);
        } else {
          this.cs360CacheService.navigateToTab({}, navigationConfig);
        }
      }
    }
  }

  tooltipVisible(evt){
    this.isTooltipVisible = evt;
  }

  richtextformatter(data){
    const GS = this._env.gsObject;
    if (GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]) {
      return formatUrlToLink(data);
    } else {
      return formatUrlToLink(unescape(data));
    }
  }
}
