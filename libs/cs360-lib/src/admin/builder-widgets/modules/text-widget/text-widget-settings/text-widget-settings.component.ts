import {Component, Inject, OnChanges, OnInit} from '@angular/core';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import { DescribeService } from "@gs/gdk/services/describe";
import {getFieldItemId, isMultiObject, SummaryWidget} from '@gs/cs360-lib/src/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { find } from 'lodash';
import { APPLICATION_MESSAGES } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { forkJoin, from, Observable, of  } from "rxjs";
import {catchError, map } from "rxjs/operators";
import { NzI18nService} from '@gs/ng-horizon/i18n';
import {  NzNotificationService } from "@gs/ng-horizon/notification";

@Component({
  selector: 'gs-text-widget-settings',
  templateUrl: './text-widget-settings.component.html',
  styleUrls: ['./text-widget-settings.component.scss']
})
export class TextWidgetSettingsComponent extends BaseWidgetComponent implements OnInit {

  public options = [];
  private objectName = "company";
  widgetForm: FormGroup;
  widgetItem: SummaryWidget;
  loading: boolean = true;
  multiObjOptions$: Observable<any[]>;
  constructor(private fb: FormBuilder,
              private ds: DescribeService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private i18nService:NzI18nService,
              private notificationService:NzNotificationService) {
    super();
    this.objectName = this.ctx.baseObject;
  }

  // No need of additional Object so we are not make any changes here
  ngOnInit() {
    const editable = this.widgetItem.config && this.widgetItem.config.properties ? this.widgetItem.config.properties.editable : false;
    const required = this.widgetItem.config && this.widgetItem.config.properties ? this.widgetItem.config.properties.required : false;
    this.widgetForm = this.fb.group({
      label: [this.widgetItem.label, [Validators.required, extraSpaceValidator]],
      id: [this.widgetItem.itemId],
      config: ['', [Validators.required]],
      editable: [editable],
      required: [required]
    });


    const host = { id: "mda", name: "mda", type: "mda" };
    if(this.ctx.associatedObjects && this.ctx.associatedObjects.length){
      this.multiObjOptions$ =
          forkJoin([this.ctx.baseObject,...this.ctx.associatedObjects ].map((object)=>{
            return from(this.ds.getObjectTree(host, object, 0, null,
                { includeChildren: false, skipFilter: true, filterFunction: this.fieldFilterFunction }))
          })).pipe(
          map((objects)=>{
            const multiObjOpts = (objects.map((item)=>
              item.children.map((field)=>({
                  ...field.data,
                  customLabel: `${field.data.objectLabel} - ${field.label}`
                }))
              ) as any).flat();
            if(this.widgetItem && this.widgetItem.config && this.widgetItem.config.objectName){
              const selectedItem =
                multiObjOpts.
                  filter((field)=> field.objectName === this.widgetItem.config.objectName &&
                    field.fieldName === this.widgetItem.config.fieldName)[0]
              this.widgetForm.patchValue({ config: selectedItem});
            }
            this.loading = false;
            return multiObjOpts;
          }),
          catchError((error)=>{
            this.notificationService.error(error.message ? error.message : this.i18nService.translate('360-lib.text_field_widget.load_error'));
            return of([]);
          }));
    }else{
      this.ds.getObjectTree(host, this.objectName, 0, null, { includeChildren: false, skipFilter: true, filterFunction: this.fieldFilterFunction })
          .then(fields => {
            this.options = this.fieldFilterFunction(fields.obj.fields);
            const seletedItem = find(this.options, (field) => field.fieldName === (this.widgetItem && this.widgetItem.config && this.widgetItem.config.fieldName));
            this.widgetForm.patchValue({ config: seletedItem });
            this.loading = false;
          });
    }
  }
  compareWith(source: any, target: any): boolean {
    if (source && target){
      if(source.objectName && target.objectName){
        return (target.fieldName === source.fieldName && target.objectName === source.objectName);
      }else{
        return source.fieldName === target.fieldName;
      }
    }
    else
      return false;
  }

  isValid() {
    return this.widgetForm.valid;
  }

  toJSON(): any {
    if (this.isValid()) {
      const { label, config, id, editable, required } = this.widgetForm.value;
      const savedConfig =
        {
        ...this.widgetItem, label, id,
        config: {
        fieldName: config.fieldName, objectName: config.objectName, dataType: config.dataType,
          properties: { editable, required }
        }
      };
      return isMultiObject(this.ctx) ? {...savedConfig, config:{
          ...savedConfig.config, itemId: getFieldItemId(id,config.objectName,config.fieldName)
        }} : savedConfig;
    } else {
      this.widgetForm.markAsTouched();
      return { isValid: false, message : APPLICATION_MESSAGES.TEXT_FIELD_SELECT };
    }
  }

  fieldFilterFunction(fields) {
    return fields.filter(item => {
      return item.dataType && item.dataType.toUpperCase() === "RICHTEXTAREA";
    });
  }

}
