import {Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { fieldInfo2path } from "@gs/gdk/utils/field";
import {ReportUtils} from "@gs/report/utils";
import { DescribeService } from "@gs/gdk/services/describe";
import { cloneDeep, isEmpty } from 'lodash';
import { FIELD_TREE_DEFAULT_OPTIONS, FIELD_TREE_DEFAULT_SEARCH_SETTINGS } from './../../../cs360.constants';
// import { allowDatatypesForFilters } from '@gs/report/reports-configuration';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import {CONTEXT_INFO, ICONTEXT_INFO} from "../../../context.token";
import { PageContext } from '../../../cs360.constants';

@Component({
  selector: 'gs-summary-report-widget-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SummaryReportWidgetSettingsComponent implements OnInit {

  public isC360: boolean;
  public visible: boolean;
  public personVisible: boolean;
  public relationshipVisible: boolean;
  public treeOptions = cloneDeep(FIELD_TREE_DEFAULT_OPTIONS);
  public fieldSearchSetting = cloneDeep(FIELD_TREE_DEFAULT_SEARCH_SETTINGS);
  public settingsFormGroup;

  constructor(private fb: FormBuilder, private i18nService: NzI18nService,
              private _ds: DescribeService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

//{360.select.select_field}=Select Field-->
select_field = this.i18nService.translate('360.select.select_field')

  ngOnInit() {
    this.buildTreeOptions();
    this.updateContext();
    this.buildFormGroup();
    this.describeObject();
  }
  buildFormGroup(){
      if(this.isC360){
        this.settingsFormGroup = this.fb.group({
          label: [{ value: null, disabled: true }, [Validators.required, extraSpaceValidator]],
          field: [null, Validators.required]
        });
      }else {
        this.settingsFormGroup = this.fb.group({
          label: [{ value: null, disabled: true }, [Validators.required, extraSpaceValidator]],
          field: [null, Validators.required],
          personField: [null, Validators.required],
          relationShipField: [null, Validators.required]
        });
      }
  }
  updateContext(){
    this.isC360 = (this.ctx.pageContext === PageContext.C360);
  }
  describeObject() {
    const { maxNestLevels, host, allowedDataTypes, baseObject } = this.treeOptions;
    this._ds.getObjectTree(host, baseObject, maxNestLevels, allowedDataTypes, {})
        .then((tree) => {
          const { config } = (this as any).widgetItem;
          this.treeOptions = {
            ...this.treeOptions,
            root: tree,
            show: true
          };
          try {
            if (!isEmpty(config.filterField)) {
              const path = fieldInfo2path({leftOperand: config.filterField}, this.treeOptions.root.children);
              const selectedField = path[path.length - 1];
              (this as any).widgetItem.config = {
                ...(this as any).widgetItem.config,
                filterField: {
                  ...(this as any).widgetItem.config.filterField,
                  label: !!selectedField && selectedField.data ? selectedField.data.label : config.filterField.fieldName // Fallback to fieldName if field doesnt exist in the object.
                }
              }
            }
          } catch (e) {}
          this.assignFormControls();
        });
  }

  assignFormControls(): void {
    const { label, config } = (this as any).widgetItem;
    if(this.isC360){
      this.settingsFormGroup.patchValue({
        label: label || config.label,
        field: config.filterField
      });
    }else{
      this.settingsFormGroup.patchValue({
        label: label || config.label,
        field: config.filterField && config.filterField[0],
        personField: config.filterField && config.filterField[1],
        relationShipField: config.filterField && config.filterField[2],
      });
    }
  }

  buildTreeOptions() {
    let { config } = (this as any).widgetItem;
    config = {
      ...config,
      sourceDetails: {
        connectionId: config.collectionDetail.connectionId,
        connectionType: config.collectionDetail.connectionType,
        objectName: config.collectionDetail.objectName
      }
    }
    this.fieldSearchSetting = {
      ...this.fieldSearchSetting,
      maintainDefaultOrder: false
    };
    this.treeOptions = {
      ...this.treeOptions,
      host: ReportUtils.getFieldTreeHostInfo(config.sourceDetails),
      allowedDataTypes: allowDatatypesForFilters('STRING').map(v => (v || '').toUpperCase()),
      baseObject: config.sourceDetails.objectName
    };
  }

  onDrodownMenuVisible(opened: boolean) {
    if (!this.visible) {
      this.visible = opened;
    }
  }

  onPersonDrodownMenuVisible(opened: boolean) {
    if (!this.personVisible) {
      this.personVisible = opened;
    }
  }

  onRelationshipVisible(opened: boolean) {
    if (!this.relationshipVisible) {
      this.relationshipVisible = opened;
    }
  }

  onFieldSelected(node: any): void {
    const { fieldInfo } = node;
    this.updateFormControlWith(fieldInfo,'field','isP360CompanyFilter');
    this.visible = false;
  }
  onPersonFieldSelected(node : any){
    const { fieldInfo } = node;
    this.updateFormControlWith(fieldInfo,'personField','isP360PersonFilter');
    this.personVisible = false;
  }
  onRelationShipFieldSelected(node : any){
    const { fieldInfo } = node;
    this.updateFormControlWith(fieldInfo,'relationShipField','isP360RelationshipFilter');
    this.relationshipVisible = false;
  }
  updateFormControlWith(fieldInfo,modalName, filterFor){
    fieldInfo.properties = {};
    fieldInfo.properties[filterFor] = true;
    this.settingsFormGroup.get(modalName).patchValue(fieldInfo);
    this.settingsFormGroup.get(modalName).updateValueAndValidity();
  }
  toJSON() {
    if (this.settingsFormGroup.valid) {
      let { config } = (this as any).widgetItem;
      const formValue = this.settingsFormGroup.getRawValue();
      let filterFieldValue;
      if(this.isC360){
        filterFieldValue = formValue.field;
      }else{
        filterFieldValue = [formValue.field,formValue.personField,formValue.relationShipField];
      }
      return {
        label: formValue.label,
        config: { ...config, filterField: filterFieldValue },
        id: this.getItemId()
      }
    } else {
      this.settingsFormGroup.markAsTouched();
      return { isValid: false };
    }
  }

  private getItemId(): string {
    const { itemId } = (this as any).widgetItem;
    return itemId;
  }

}

function allowDatatypesForFilters(primaryDatatype: string): string[] {
  switch (primaryDatatype) {
      case 'STRING':
          // return ["STRING", "SFDCID", "REFERENCE", "LOOKUP", "GSID"].map(d => d.toLowerCase());
          return ["STRING", "SFDCID", "REFERENCE", "LOOKUP", "GSID"]; //TODO: Visit this area again after cross checking with latest gdk
      default: null
  }
}
