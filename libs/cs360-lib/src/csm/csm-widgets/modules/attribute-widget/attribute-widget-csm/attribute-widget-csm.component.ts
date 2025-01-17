import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { CsmSummaryService } from '../../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../../csm-widget-base/csm-widget-base.component';
import { isEmpty,camelCase } from 'lodash';
import {
    EventType,
    WidgetItemType,
    CONTEXT_INFO,
    WidgetTypes,
    CustomizedField,
    WidgetItemSubType,
    WidgetPayloadDataTypes,
    isMini360, calculateAttrsNCellsToShow
} from '@gs/cs360-lib/src/common';
import {
    CsmAttributeGroupMiniComponent
} from "../../../../csm-sections/modules/csm-attribute/csm-attribute-group-mini/csm-attribute-group-mini.component";

@Component({
  selector: 'gs-attribute-widget-csm',
  templateUrl: './attribute-widget-csm.component.html',
  styleUrls: ['./attribute-widget-csm.component.scss']
})
export class AttributeWidgetCsmComponent extends CsmWidgetBaseComponent implements OnInit {

  fields: CustomizedField[] = [];
  public context = WidgetTypes.ATTRIBUTE_SECTION;
    showingMore = false;
    isMini360;
    @ViewChild('csmAttributeGroup', { static: false }) attributeGroupWidget: CsmAttributeGroupMiniComponent;
    showExpandButton: boolean;
  constructor(csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx) {
    super(csmSummaryService, ctx);
  }

  ngOnInit() {
      this.isMini360 = isMini360(this.ctx);
    // Need to test for single object here we flatten array for multi object like [{P:[], cp:[], rp:[]}]
    this.fields = this.widgetItem && this.widgetItem.config && this.widgetItem.config ?  this.widgetItem.subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE ?  this.flattenConfig(this.widgetItem.config) : this.widgetItem.config   :  [];
    const {totalColumnsNeeded, initialColumnsNeeded} = calculateAttrsNCellsToShow(this.fields);
    this.showExpandButton = totalColumnsNeeded > initialColumnsNeeded;
    this.getData();
  }

  flattenConfig(config){
      let flattenData = []
      if(config !== undefined && config.length){
         this.ctx.associatedObjects.length && [this.ctx.baseObject, ...this.ctx.associatedObjects].forEach((obj)=>{
          config[0].hasOwnProperty(obj) && flattenData.push(...config[0][obj])
        })
      }

      return flattenData;
    }

  protected getData() {
    this.csmSummaryService.getData(this.widgetItem.widgetType).subscribe((data) => {
      if (!isEmpty(data)) {
        this.data = data;
        this.isSaveInProgress = false;
        this.isLoading = false;
      }
      this.editMode = false;
      delete this.widgetItem.isSaving;
      delete this.widgetItem.updatedLabel;
      delete this.widgetItem.isEdit;

      this.fields.forEach(field => {
        field.isSaving = false;
        field.isEditing = false;
        if(field.hidden){
            this.fields.splice(this.fields.indexOf(field), 1)
        }
      });
      this.dataLoaded();
    });
  }

/**
 * Approach for mutli ATTRIBUTE IS we get data:{fieldcahnegInfo , changed Item meta} this only we modify as our payload and
 * pass to next onActionEvent to call the api other tahn section for consumption team
 *
 */

// property itself have to remove if its single object
  onAction(event) {
    const { type, data } = event;
    if (type === 'SAVE') {
      let widgetsavedata = {
        eventType: EventType.SAVE, 
        contextCategory: WidgetItemType.CR, 
        entityType: event.entityType, 
        entityId: event.entityId, 
        dataEditEntityId: event.dataEditEntityId, 
        data: event.payload,
      }
      if(this.widgetItem.subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE){
        this.csmSummaryService.dispatchWidgetEvent( {...widgetsavedata, multiAttributeData: this.getWidgetPayload(event)  });
      }else{
        this.csmSummaryService.dispatchWidgetEvent(widgetsavedata);
      }
    } else if(type === EventType.RESIZE) {
        this.resizeItem(data);
    }

  }

  /***
   * We need payload with all CR type object wise widget config so we construct this payload for that
   * for single object we honor same old approach where we depend on sectionId
   */
  getWidgetPayload(event){
    // Need to remove once save config is resolved by this issue
   if(this.widgetItem.config[0].hasOwnProperty('axisDetails')) {
    delete this.widgetItem.config[0].axisDetails
   }
   if(this.widgetItem.config[0].hasOwnProperty('dimensionDetails')) {
    delete this.widgetItem.config[0].dimensionDetails
   }
   let objectGsidKey = event.item.objectName + '.Gsid';
   const valueFieldKey = event.item.objectName + '.' + event.item.fieldName;
    return {
          "updateRecord": {
            [objectGsidKey]: this.ctx[camelCase(objectGsidKey)] || this.ctx.entityId,
            [valueFieldKey]: event.item.dataType === WidgetPayloadDataTypes.MULTISELECTDROPDOWNLIST ? event.payload[event.item.fieldName].join(';') : event.payload[event.item.fieldName]
          },
          "multiObjectConfig": {
            "config": this.csmSummaryService.allCRWidgetconfigs,
            "entityId": this.ctx.entityId || '',
            "relationshipId": this.ctx.rId || '' ,
            "companyId": this.ctx.cId || ''
        },
        "objectName": event.item.objectName
      }
  }

    resizeItem(data?) {
        if (data) {
            this.csmSummaryService.dispatchWidgetEvent({
                eventType: EventType.RESIZE,
                data: {fields: this.fields, operator: this.showingMore ? 1 : -1, data},
                widget: this.widgetItem
            });
        } else {
            const viewAll = !this.showingMore;
            /* resize inner div first on view all/view less, then get it's height inside setTimeout to calculate rows needed by outer gridster item used in summary*/
            this.attributeGroupWidget.resizeItem({viewAll});
            setTimeout(() => {
                this.csmSummaryService.dispatchWidgetEvent({
                    eventType: EventType.RESIZE,
                    data: {fields: this.fields, viewAll, data: this.attributeGroupWidget.getGroupHeight()},
                    widget: this.widgetItem
                });
            });
            this.showingMore = !this.showingMore;
        }
    }

    dataLoaded() {
        super.dataLoaded();
        setTimeout(() => {
            if (this.attributeGroupWidget) {
                /* resize outer gridster item in summary once data is loaded. Using setTimeout to make sure rendering is done */
                this.resizeItem(this.attributeGroupWidget.getGroupHeight())
            }
        });

    }
}
