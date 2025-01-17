import {Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { includes, size } from 'lodash';
import { CustomizedField, Customize_Field_Options, FieldConfigurationActionInfo, FieldConfigurationActions, FieldConfigurationOptions, FieldConfigurationUtils, getDefaultFormat, getIsEditDisabled, getLookupDisplayField, findFieldInTreeByFieldPath } from '../field-configuration/field-configuration';
import { SubSink } from 'subsink';
import * as Constants from '../../cs360.defaults';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import {ReportUtils} from "@gs/report/utils";
import { MessageType } from '@gs/gdk/core';
import {compareFields, findPath, path2FieldInfo} from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { DefaultFieldSearchSetting, FieldTreeViewActions, FieldTreeViewOptions } from '../../pojo/field-tree-view-wrapper.interface';
import { Cs360ContextUtils } from '../../cs360.context';
import { IADMIN_CONTEXT_INFO, ADMIN_CONTEXT_INFO } from '../../admin.context.token';
import {filter, isUndefined, isNull} from 'lodash';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzNotificationService} from "@gs/ng-horizon/notification";
import { NzI18nService } from '@gs/ng-horizon/i18n';
import {NzIconService} from "@gs/ng-horizon/icon";
import { PageContext } from './../../cs360.constants';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { TranslocoService } from '@ngneat/transloco';
import {FieldChooserComponent} from "@gs/gdk/field-chooser";
import { DataTypes } from '../../cs360.defaults';
// import { MappingObjects } from '@gs/cs360-lib/src/portfolio-copy';
import { WidgetCategoryType, WidgetItemSubType } from '../../pojo';
// import { SummaryConfigurationService } from '../../summary-configuration/summary-configuration.service';
// import { MappingObjects } from '../../../../../../portfolio-lib';
import { SummaryConfigurationService } from '../../services/summary-configuration.service';
import { DescribeService } from "@gs/gdk/services/describe";
import {FieldTreeViewWrapperComponent} from "../field-tree-view-wrapper/field-tree-view-wrapper.component";
import {FieldTreeNode} from "@gs/gdk/core/types";


enum MappingObjects {
  GS_COMPANY_ID = "company",
  GS_COMPANY_NAME = "company",
  GS_USER_ID = "gsuser",
  GS_USER_NAME = "gsuser",
  GS_USER_EMAIL = "gsuser",
  GS_RELATIONSHIP_ID = "relationship",
  GS_RELATIONSHIP_NAME = "relationship",
  GS_RELATIONSHIP_TYPE_ID = "relationship_type",
  GS_RELATIONSHIP_TYPE_NAME = "relationship_type"
}
@Component({
  selector: 'gs-field-configuration',
  templateUrl: './field-configuration.component.html',
  styleUrls: ['./field-configuration.component.scss']
})
export class FieldConfigurationComponent implements OnInit, OnDestroy {

  @ViewChild('searchableFieldTree', {static: false}) searchableFieldTree: FieldTreeViewWrapperComponent;

  @ViewChild('displayFieldTree', {static: false}) displayFieldTree: FieldTreeViewWrapperComponent;

  @Input() field: CustomizedField;
  @Input() fieldConfigOptions: FieldConfigurationOptions;
  @Input() showFooter: boolean = true;
  @Output() fieldConfigAction = new EventEmitter<FieldConfigurationActionInfo>();
  @Input() navigateOptions: any[] = [];

  // This original dropped node is needed to get the selected display field info properly
  // For more details, check the usage
  @Input() rootNode: FieldTreeNode;

  constants = Constants;
  lookupDisplayField;
  searchableFields = [];
  showDisplayFieldOptions = false;
  showSearchableFieldOptions = false;
  displayFieldTreeOptions: FieldTreeViewOptions;
  searchableFieldsTreeOptions: FieldTreeViewOptions;
  parentField: any;
  aggregationOptions = Constants.AggregationOptions;
  fieldConfigForm: FormGroup;
  fieldConfigControlOptions: FieldConfigurationOptions;
  editDisabled = false;
  fieldPaths = [];
  urlDataTypes: any = ["RICHTEXTAREA", "URL"];
  showAssignSection: boolean;
  loading = false;
  options: GSField[] = [];
  ShowUserLookUpField = false;
  pathFieldVisiblity = true;

  protected subs = new SubSink();
  configFieldName: any;

  constructor(
    public fb: FormBuilder,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    public notification: NzNotificationService,
    @Inject("envService") public env: EnvironmentService, private i18nService: NzI18nService,
    private translocoService: TranslocoService,
    private summaryConfigurationService?: SummaryConfigurationService,
    private iconService?: NzIconService, private ds?: DescribeService,) { }

  ngOnInit() {
    const moduleConfig = this.env.moduleConfig;
    if(moduleConfig.configuredSections && moduleConfig.configuredSections.length){
      this.navigateOptions = filter(moduleConfig.configuredSections, (section)=>section.sectionType !=='SUMMARY');
    }
    this.fieldConfigForm.get('navigationConfig').setValue(this.getNavigationConfig());
    if (this.field.dataType || (this.field.config && this.field.config.dataType)) {
      this.showAssignSection = this.urlDataTypes.indexOf(this.field.dataType || this.field.config.dataType) <= -1;
    }
    this.prepareIconService();
    this.setDateFieldOptions(this.field);
    this.pathFieldShow(this.field)
  }

  ngOnChanges() {
    if (this.field) {
      this.setFieldConfigOptions();
      this.setFieldConfigForm();
    }
  }

    protected async prepareIconService() {
        // if(this.ctx.pageContext === PageContext.C360){
        //     var cdnPath = await getCdnPath("cs360-admin");
        // } else {
        //     var cdnPath = await getCdnPath("r360-admin");
        // }
        var cdnPath = await getCdnPath(this.ctx.cdnPath);
        // const baseUrl = 'https://localhost:4200'; /// for local testing
        this.iconService.changeAssetsSource(cdnPath);
    }

  private setFieldConfigOptions() {
    this.fieldConfigControlOptions = FieldConfigurationUtils.getFieldConfigOptions(this.field, { ...this.fieldConfigOptions });
    if (this.fieldConfigControlOptions.showAggregationType && this.field.dataType === Constants.DataTypes.PERCENTAGE) {
      this.aggregationOptions = this.aggregationOptions.filter(opt => opt.value !== "sum");
    }
  }

    pathFieldShow(field: any){
      if((field.widgetCategory === WidgetCategoryType.STANDARD) && (field.subType === WidgetItemSubType.CSM)){
        this.pathFieldVisiblity = false;
      }
    }

  setDateFieldOptions(field :any ) {
    if((field.widgetCategory === WidgetCategoryType.STANDARD) && (field.subType === WidgetItemSubType.CSM)){
      this.ShowUserLookUpField = true;
    }
    const host = { id: "mda", name: "mda", type: "mda" };
    this.loading = true;
    this.ds.getObjectTree(host, this.ctx.baseObject, 0, null, { includeChildren: false, skipFilter: true })
      .then(fields => {
        this.options = (fields.obj.fields || []).filter(fld => ([DataTypes.LOOKUP.toString()].includes(fld.dataType) &&  this.getLookupObject(fld) === 'gsuser' ));
        this.loading = false;
      });

    }

  getLookupObject(field) {
    let objectName: string;
    if(field && field.meta) {
      if(field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0]) {
        objectName = field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0] && field.meta.lookupDetail.lookupObjects[0].objectName;
      } else {
        objectName = field.meta.mappings && field.meta.mappings.GAINSIGHT && MappingObjects[field.meta.mappings.GAINSIGHT.key];
      }
    }
    return objectName;
  }

  protected setFieldConfigForm() {
    this.field.properties = this.field.properties ? this.field.properties : {};
    this.configFieldName =  this.configFieldName ? this.configFieldName : null;
    this.lookupDisplayField = this.field.lookupDisplayField;
    this.initSearchableFields();
    this.field.formatOptions = this.field.formatOptions ? this.field.formatOptions : {};
    this.editDisabled = getIsEditDisabled(this.field, this.ctx);
    this.fieldConfigForm = this.fb.group({
      label: [this.field.label, [Validators.required, extraSpaceValidator, Validators.maxLength(90)]],
      description: this.field.description,
      editable: this.editDisabled? false : !!this.field.properties.editable,
      required: this.field.meta && this.field.meta.required ? this.field.meta.required : this.field.properties && this.field.properties.required,
      width: this.field.properties.width ? this.field.properties.width : Constants.DEFAULT_RTA_WIDTH,
      type: this.field.formatOptions.type ? this.field.formatOptions.type : getDefaultFormat(this.field.dataType),
      numericalSummarization: this.field.formatOptions.numericalSummarization ? this.field.formatOptions.numericalSummarization : 'DEFAULT',
      scale: this.field.scale !== undefined ? this.field.scale : this.field.meta && this.field.meta.decimalPlaces,
      rollup: this.field.properties.rollup,
      aggregateFunction: this.field.aggregateFunction ? this.field.aggregateFunction.toUpperCase() : null,
      navigationConfig: null, // will set this in ngOnInit when we get navigationOptions
      lookupDisplayField: this.field.lookupDisplayField && this.field.lookupDisplayField.label,
      searchableFields: [this.searchableFields.map(f => f.label)],
      lookupDisplayFieldName : this.field && this.field.config && this.field.config.fieldName
    });
    this.subs.add(this.fieldConfigForm.valueChanges.subscribe(formValue => {
      this.setSearchableFieldsVisibility(formValue.editable);
      this.fieldConfigControlOptions.showRequired = this.fieldConfigOptions.showRequired && formValue.editable;
      this.fieldConfigControlOptions.showNumericSummarization = includes(Customize_Field_Options.numericalSummarization, formValue.type);
    }));
    this.subscribeToEditableRadio();
    this.subscribeToLookupDisplayField();
    this.subscribeToSearchableFields();
    this.subscribeToRollupAggr();
    this.getFieldLabel(this.field);
  }

    setSearchableFieldsVisibility(editable: boolean): void {
        this.fieldConfigControlOptions.showSearchConfig = this.fieldConfigOptions.showSearchConfig && editable && this.field.meta.hasLookup;
    }

  initSearchableFields(): void {
      this.searchableFields = (
          this.field.searchableFields &&
          this.field.searchableFields.length
      ) ? [...this.field.searchableFields] : (this.field.nameField ? [this.field.nameField] : []);
  }

  subscribeToSearchableFields(): void {
      this.subs.add(this.fieldConfigForm.get("searchableFields").valueChanges.subscribe(formValue => {
          if(this.fieldConfigOptions.showSearchConfig) {
              this.searchableFields = this.searchableFields.filter(x => formValue && formValue.includes(x.label));
              if(this.searchableFields.length) {
                this.searchableFieldsTreeOptions = {...this.searchableFieldsTreeOptions, fieldInfo: this.searchableFields};
              }
          }
      }));
  }

  subscribeToLookupDisplayField(): void {
        this.subs.add(this.fieldConfigForm.get("lookupDisplayFieldName").valueChanges.subscribe(formValue => {
          if(formValue) {
              const fields = this.summaryConfigurationService.getobjectmetadata();
              const node = findFieldInTreeByFieldPath(this.field, {children:fields});
              this.editDisabled = !node.data.meta.updateable;
              if(!node.data.meta.updateable){
                  this.fieldConfigForm.get("editable").setValue(false);
              }
              if(this.ShowUserLookUpField) { //we are setting lookupdisplay field  here , for the user field  display , this boolean flag will take care that it is happening in the  specific case only.
                  this.lookupDisplayField = getLookupDisplayField({...this.field, data: node.data , dataType : "LOOKUP"},  node.children);
              }
              this.configFieldName = formValue;
          }
        }));
    }

  subscribeToRollupAggr(): void {
      this.subs.add(this.fieldConfigForm.get("rollup").valueChanges.subscribe(rollup => {
          const aggrValue = this.fieldConfigForm.get("aggregateFunction").value;
          if (rollup && !aggrValue) {
              this.fieldConfigForm.get("aggregateFunction").setValue(this.getDefaultAggregation());
          } else if(!rollup) {
              this.fieldConfigForm.get("aggregateFunction").reset();
          }
      }));
  }

  subscribeToEditableRadio(): void {
      this.subs.add(this.fieldConfigForm.get("editable").valueChanges.subscribe(formValue => {
          if(formValue && formValue.editable) {
              this.fieldConfigForm.get("navigationConfig").reset();
          }
      }));
  }

  getNavigationConfig() {
    const navigationConfig = this.field.properties && this.field.properties.navigationConfig;
    if(!navigationConfig || !this.navigateOptions.find(opt => opt.sectionId === navigationConfig)) {
      return 'NONE';
    }

    return navigationConfig;
  }

    /**
     * This will give the nesting levels of a node
     */
    getFieldLabel(field) {
        this.fieldPaths = [];
        let translatebaseObject = this.ctx.translatedBaseObjectLabel;
        const baseObject = this.i18nService.translate(field.baseObjectName ? `360.csm.objectLabels_${field.baseObjectName}` : translatebaseObject);
        if (!field.fieldPath) {
            this.fieldPaths.push(baseObject, field.hoverLabel || field.label);
            return;
        }

        let fieldPath = field.fieldPath;
        this.fieldPaths.push(baseObject);
        while (fieldPath) {
            this.fieldPaths.push(fieldPath.right.fieldLabel || fieldPath.right.label);
            fieldPath = fieldPath.fieldPath;
        }
        this.fieldPaths.push(field.hoverLabel || field.label);
    }
 // {360.admin.field_config_average}=AVG.
 // {360.admin.field_config_sum}=SUM.
  protected getDefaultAggregation() {
    return this.field.dataType === Constants.DataTypes.PERCENTAGE ? "AVG" : "SUM";
  }

  submitForm(): void {
    for (const i in this.fieldConfigForm.controls) {
      this.fieldConfigForm.controls[i].markAsDirty();
      this.fieldConfigForm.controls[i].updateValueAndValidity();
    }
  }

    protected setDisplayFieldTreeOptions() {
        this.displayFieldTreeOptions = this.getDisplayFieldTreeOptions();
    }

    protected setSearchableFieldTreeOptions() {
        this.searchableFieldsTreeOptions = this.getSearchableFieldTreeOptions();
    }

    protected getDisplayFieldTreeOptions(): any {
        const options = {
            host: ReportUtils.getFieldTreeHostInfo({
              "objectName": this.ctx.baseObject,
              "objectLabel": this.translocoService.translate(this.ctx.translatedBaseObjectLabel),
              "connectionType": "MDA",
              "connectionId": "MDA",
              "dataStoreType": "HAPOSTGRES"
            }),
            fieldSearchSetting: {
                ...DefaultFieldSearchSetting,
                maintainDefaultOrder: false
            },
            dragOptions: {
                isOutsideDroppable: false,
                isDragIndicatorRequired: false,
                isDataTypeIconRequired: true
            },
            filterFunction: this.fieldFilterFunction.bind(this),
            root: null,
            expandAll: true,
            maxNestLevels: 1,
            nestOnDemand: false,
            enablePartialTree: false,
            baseObject: this.rootNode.data.objectName,
            selectionMode: "single",
            fieldInfo: this.getFieldsToSelect([this.lookupDisplayField])[0],
            disableNodeUnSelectBehavior: true,
            allowSelectEvent: true
        };
        return options;
    }

    protected getSearchableFieldTreeOptions(): any {
        return {
            ...this.getDisplayFieldTreeOptions(),
            filterFunction: this.fieldFilterFunction.bind(this),
            selectionMode: "multiple",
            allowUnSelectEvent: true,
            metaKeySelection: false,
            selection: null,
            isDataTypeIconRequired: true,
            showLookupInfo: false,
            emptyMessage: "",
            nestOnDemand: false,
            disableNodeUnSelectBehavior: false,
            fieldInfo: Array.isArray(this.searchableFields) && this.searchableFields.length
                ? this.getFieldsToSelect(this.searchableFields) : null
        };
    }

    protected fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
        fields = fields.filter(field => ![
            Constants.DataTypes.IMAGE,
            Constants.DataTypes.RICHTEXTAREA
        ].includes(field.dataType as any));
        if(uniqueKey === this.field.fieldName) {
            return fields.filter(field => [
                Constants.DataTypes.STRING,
                Constants.DataTypes.EMAIL,
                Constants.DataTypes.URL,
                Constants.DataTypes.GSID
            ].includes(field.dataType as any));
        } else {
            this.parentField = fields.find(x => x.fieldName === this.field.fieldName);
            if(!!this.parentField) {
                return fields.filter(x => x.fieldName === this.field.fieldName);
            } else if(!!this.field) {
                const fieldInfo: any = this.getFieldInfo(this.field);
                this.parentField = fieldInfo;
                return [fieldInfo];
            }
        }
    }

    private getFieldsToSelect(fields: GSField[]): GSField[] {
        const fieldsToSelect = (fields || []).map(f => {
            const node = (this.rootNode.children || []).find(c => c.data.fieldName === f.fieldName);
            const path = findPath(node);

            // In field config, always 2 level tree is displayed. Parent field + children
            // So hard coding check for > 2
            // Any inner field, set path anf fieldInfo properly to set it selected in tree
            if (path.length > 2) {
                path.pop();
            }
            return path2FieldInfo(path);
        });
        return fieldsToSelect;
    }

    onDisplayFieldDropdownToggle(visible) {
        if (visible) {
            this.setDisplayFieldTreeOptions();
            if (this.displayFieldTree) {
                this.displayFieldTree.setSelectedField(this.getFieldsToSelect([this.lookupDisplayField])[0]);
            }
        } else {
            this.displayFieldTreeOptions = null;
        }
    }

    onSearchableFieldDropdownToggle(visible) {
        if (visible) {
            this.setSearchableFieldTreeOptions();
            if (this.searchableFieldTree) {
                this.searchableFieldTree.setSelectedField(this.getFieldsToSelect(this.searchableFields));
            }
        } else {
            this.searchableFieldsTreeOptions = null;
        }
    }

    onDisplayFieldSelect(event): void {
        if (event.action === FieldTreeViewActions.SelectedFieldChange) {
            this.showDisplayFieldOptions = false;
            let config_message = this.i18nService.translate('360.admin.field_config_message');
            if (event.info.selectedField.data.dataType === Constants.DataTypes.LOOKUP) {
                this.openToastMessageBar({message: config_message, action: null, messageType: MessageType.ERROR });
                return;
            } else {
                const field = path2FieldInfo(findPath(event.info.selectedField));
                this.lookupDisplayField = field;
                this.fieldConfigForm.get("lookupDisplayField").setValue(this.lookupDisplayField.label);
            }
            this.displayFieldTreeOptions = {...this.displayFieldTreeOptions, fieldInfo: this.lookupDisplayField};
        }
    }

    onSearchableFieldSelect(event): void {
        if (event.action === FieldTreeViewActions.SelectedFieldChange) {
            this.showSearchableFieldOptions = false;
        }
        const config_message = this.i18nService.translate('360.admin.field_config_message');
        const config_message_max = this.i18nService.translate('360.admin.field_config_message_maximum');
        if (event.info.unselect) {
            const field = path2FieldInfo(findPath(event.info.node));
            this.searchableFields = this.searchableFields.filter(f => !compareFields(f, field));
            this.fieldConfigForm.get("searchableFields").setValue(this.searchableFields.map(x => x.label));
            this.searchableFieldsTreeOptions = {...this.searchableFieldsTreeOptions, fieldInfo: this.searchableFields};
        } else if (
            event.info.selectedField &&
            event.info.selectedField.data.dataType === Constants.DataTypes.LOOKUP
        ) {
            this.openToastMessageBar({message: config_message, action: null, messageType: MessageType.ERROR });
            return;
        } else if (this.searchableFields.length === 3) {
            this.openToastMessageBar({message: config_message_max, action: null, messageType: MessageType.ERROR });
            return;
        } else if (this.searchableFields.length < 3) {
            if (!this.searchableFields) {
                this.searchableFields = [];
            }
            this.searchableFields.push(event.info.selectedField.data);
            this.fieldConfigForm.get("searchableFields").setValue(this.searchableFields.map(x => x.label));
            this.searchableFieldsTreeOptions = {...this.searchableFieldsTreeOptions, fieldInfo: this.searchableFields};
        } else {
            // do if anything falls here
        }
    }

  protected openToastMessageBar({ message, action = "", messageType }) {
    this.notification.remove();
    if (message !== null) {
      this.notification.create(messageType,'', message, [],{nzDuration:5000})
    }
  }

  handleFooterActions(event: string) {
    switch (event) {
      case FieldConfigurationActions.CANCEL:
        this.fieldConfigAction.emit({ action: event, field: null });
        break;
      case FieldConfigurationActions.SAVE: {
        this.submitForm();
        if (!this.fieldConfigForm.valid) {
          return;
        }
        this.field = this.toJSON();
        this.fieldConfigAction.emit({ action: event, field: this.field });
        break;
      }
    }
    this.fieldConfigForm.reset();
  }

  toJSON(): any {
    const formattedLookupField = this.fieldConfigControlOptions.showLookupDisplayField && this.lookupDisplayField && this.lookupDisplayField.fieldName ? {...this.lookupDisplayField, type: "BASE_FIELD"} : null;
    if(formattedLookupField) {
      delete formattedLookupField.meta;
      delete formattedLookupField.dbName;
      delete formattedLookupField.objectDBName;
    }
    const updatedConfig = this.fieldConfigForm.getRawValue();
    // NOTE: here fair assumption is at one level, there will be uniq field names
    // Get the original node to build fieldInfo as it is lost in the tree because here we show incomplete tree
    const lookupDisplayNode = (this.rootNode ? this.rootNode.children : []).find(c => c.data && c.data.fieldName === this.lookupDisplayField && this.lookupDisplayField.fieldName);
    const lookupDisplayField = lookupDisplayNode ? path2FieldInfo(findPath(lookupDisplayNode)) : {};
    const showSearchableFields =
        this.fieldConfigControlOptions.showSearchConfig && (
        (this.field.meta && this.field.meta.updateable) || this.field.fieldPath);
    return {
      ...this.field,
      configFieldName  : this.configFieldName,
      properties: {
        ...this.field.properties,
        editable: updatedConfig.editable,
        width: updatedConfig.width,
        required: updatedConfig.required,
        rollup: updatedConfig.rollup,
        navigationConfig: updatedConfig.navigationConfig === "NONE" ? null : updatedConfig.navigationConfig,
        requiredDisabled: !isUndefined(this.field.meta && this.field.meta.required) ? this.field.meta.required : this.field.properties.requiredDisabled,
        SEARCH_CONTROLLER : {
          objectName: this.field.lookupDisplayField && this.field.lookupDisplayField.objectName,
          fields: showSearchableFields ? this.searchableFields.map(x => x.fieldName) : []
        }
      },
      lookupDisplayField: formattedLookupField ? {...formattedLookupField, ...lookupDisplayField} : formattedLookupField,
      formatOptions: {
        type: updatedConfig.type,
        numericalSummarization: this.fieldConfigControlOptions.showNumericSummarization ? updatedConfig.numericalSummarization : null
      },
      label: updatedConfig.label.trim(),
      description: updatedConfig.description,
      aggregateFunction: updatedConfig.aggregateFunction,
      scale: updatedConfig.scale
    };
  }

  getFieldInfo(path: any): any {
    const field: any = path;
    const {fieldName, objectDBName, objectName, dataType, dbName, fieldPath, objectLabel, label, key, meta} = field;
    return {
      fieldName,
      key,
      dbName,
      dataType,
      label,
      objectName,
      objectDBName,
      objectLabel,
      fieldPath,
      meta
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}


