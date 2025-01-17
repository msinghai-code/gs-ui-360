import {Component, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { CSMAttributeService } from './csm-attribute.service';
import {calculateAttrsNCellsToShow, CONTEXT_INFO, ICONTEXT_INFO} from '@gs/cs360-lib/src/common';
import { LOADER_TYPE } from '@gs/gdk/spinner';
import { DescribeService } from "@gs/gdk/services/describe";
import { WidgetTypes } from '@gs/cs360-lib/src/common';
import { CS360Service } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import {CsmAttributeGroupMiniComponent} from "./csm-attribute-group-mini/csm-attribute-group-mini.component";

const MDA_HOST = { id: 'MDA', name: 'MDA', type: 'MDA' };
@Component({
  selector: 'gs-csm-attribute',
  templateUrl: './csm-attribute.component.html',
  styleUrls: ['./csm-attribute.component.scss']
})
export class CsmAttributeComponent implements OnInit {

  @Input() section;
  @ViewChildren('csmAttributeGroup') attributeGroupWidget: QueryList<CsmAttributeGroupMiniComponent>;

  public config;
  options: any;
  public data;
  public isLoading = false;
  public context = WidgetTypes.ATTRIBUTE_WIDGET;
  public attrText = this.i18nService.translate('360.csm.attribute_comp.attributes');
  loaderOptions = {
    loaderType: LOADER_TYPE.SVG,
    loaderParams: {
      svg_url_class: 'gs-loader-vertical-bar-skeleton',
      svg_wrapper_class: 'gs-loader-vertical-bar-skeleton-wrapper-opacity'
    }
  };
  public isMini360 = false;
  showingMore: boolean[] = [];
  showMoreApplicable: boolean[] = [];
  constructor(
    private attrService: CSMAttributeService, 
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    private _ds: DescribeService,
    private c360Service: CS360Service,
    public i18nService:NzI18nService
  ) { }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.getData();
  }

  getData(data = {}) {
    this.isLoading = true;
    this.attrService.getSectionData({
      "entityId": this.ctx.entityId,
      "layoutId": this.section.layoutId,
      "sectionId": this.section.sectionId,
      data
    }).subscribe(data => {
        this.data = data.data[0];
        if(this.data){
          this.processResp(data.data[0]);
          this.config = this.section.config && this.section.config.groups;
          this.showingMore = Array(this.config.length).fill(false);
          this.showMoreApplicable = this.config.map(group => {
          const {totalColumnsNeeded, initialColumnsNeeded} = calculateAttrsNCellsToShow(group.columns);
          return totalColumnsNeeded > initialColumnsNeeded;
        });
      }
      this.isLoading = false; 
    });
  }


  onRefresh() {
    this.getData();
  }

  onAttributeUpdates(evt) {
    if(evt.type === "SAVE") {
      this.getData();
      const fieldLabel =  evt.payload && evt.payload.fieldLabel;
      delete evt.payload.fieldLabel;
      this.attrService.saveAttributeAndGetData({
        "entityId": evt.entityId,
        "dataEditEntityId": evt.dataEditEntityId,
        "layoutId": this.section.layoutId,
        "sectionId": this.section.sectionId,
        entityType: evt.entityType,
        data: evt.payload
      }).subscribe(res => {
        if(res.success) {
          this.data = res.data[0];
          // this.toastMessageService.add(`${fieldLabel}  has been updated successfully.`, MessageType.SUCCESS, null, { duration: 5000 });
          this.c360Service.createNotification( 'success',fieldLabel+" "+this.i18nService.translate('360.csm.attribute_csm.updatedSuccessfully') ,5000);
        } else if(res.error && res.error.message) {
          this.attrService.setAttrSaveError();
          // this.toastMessageService.add(res.error.message, MessageType.ERROR, null, { duration: 5000 });
          this.c360Service.createNotification( 'error',res.error.localizedMessage || res.error.localizedErrorDesc ||res.error.message,5000);
        }
        this.processResp(this.data);
      })
    }
  }

  processResp(data) {
    if(!this.section.config) {
      return;
    }

    this.section.config.groups.forEach(grp => {
        const arrayOfObjects = grp.columns.filter(col => !col.hidden);

        grp.columns = arrayOfObjects;
        grp.columns && grp.columns.forEach(col => {
            col.isSaving = false;
            col.isEditing = false;

            if(!col.properties.editable) {
                col.showLockedInfo = true;
            }
            try {
                if(col.dimensionDetails) {
                    col.rows = col.dimensionDetails.rows;
                    col.cols = col.dimensionDetails.cols;
                }
                col.value = data[col.itemId];
            } catch(e) {

            }
        });
    });
  }
  resizeItem(fields, i) {
    const viewAll = !this.showingMore[i];
    this.attributeGroupWidget.toArray()[i].resizeItem({viewAll});
    this.showingMore[i] = !this.showingMore[i];
  }
}

