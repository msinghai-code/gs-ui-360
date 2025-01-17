import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer,
  ViewChild,
  Pipe,
  PipeTransform,
  ChangeDetectorRef
} from '@angular/core';
import {
  FilterQueryService,
} from "@gs/gdk/filter/builder";
import { getFormErrors } from '@gs/gdk/services/formly';
import { DescribeService } from "@gs/gdk/services/describe";
import {FormBuilder} from '@angular/forms';
import {isMini360, MDA_HOST} from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
// import { DataTypes, FieldEditorComponent, getFieldId, InlineEditData, MappingObjects, PORTFOLIO_WIDGET_CONSTANTS, WidgetField } from '../../../../../portfolio-lib';
import { DataTypes, MappingObjects, FieldEditorComponent, InlineEditData, PORTFOLIO_WIDGET_CONSTANTS, WidgetField, PortfolioWidgetService } from '@gs/cs360-lib/src/portfolio-copy';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { keys, isEmpty, unescape, includes, isEqual } from 'lodash';
import { CSMAttributeService } from './../../csm-sections/modules/csm-attribute/csm-attribute.service';
// import * as moment from 'moment';
import * as moment_ from 'moment-timezone';
const moment = moment_;
import { findFieldInTreeByFieldPath } from '@gs/cs360-lib/src/common';
import { PxService } from '@gs/cs360-lib/src/common';
import { PX_CUSTOM_EVENTS } from '@gs/cs360-lib/src/common';
import { RteFroalaOptions, RteOptions } from '@gs/gdk/rte/gs-rte.interface';
import {EnvironmentService, UserService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { purifyDomForString } from "@gs/cs360-lib/src/portfolio-copy"
import { cloneDeep } from "lodash";
import { LookSearchConfig } from '@gs/gdk/lookup-search';
import { GsRteComponent } from '@gs/gdk/rte';
import { formatUrlToLink } from '../../../../src/common/cs360.utils';

interface AttributeField extends WidgetField {
  controllingFields?: any[];
  controllingFieldLabels?: string;
}

const DIRECT_EDIT_TYPES: string[] = [DataTypes.BOOLEAN];
@Component({
  selector: 'gs-attribute-field-editor',
  host: {'(input-blur)':'onInputBlur($event)'},
  templateUrl: './attribute-field-editor.component.html',
  styleUrls: ['./attribute-field-editor.component.scss']
})
export class AttributeFieldEditorComponent extends FieldEditorComponent implements OnInit, OnChanges {

  isReadMode = true;
  managedByOptions: LookSearchConfig = {
    dropDownType: "TABULAR",
    objDetails: [
      {
        objectName: "company",
        searchConfig: {
          searchFields: [
            {
              type: "",
              fieldName: "Name",
              label: "Name",
              dataType: "string",
              objectName: "company",
            },
            {
              type: "",
              fieldName: "ManagedAs",
              label: "ManagedAs",
              dataType: "string",
              objectName: "company",
            },
          ],
          displayField: {
            type: "",
            fieldName: "Name",
            label: "Name",
            dataType: "string",
            objectName: "company",
          },
        },
      },
    ],
  };

  isSaving = false;
  field: AttributeField;
  resetValue = false;
  isTooltipVisible = false;
  isManagedByRequired: boolean = false;
  timeZone = "";
  prevFields;
  isValueChanged:boolean = false;
  valueChangedKey: any;
  // 360.csm.field_editor.placeholderText = Insert text here
  rteOptions: Partial<RteOptions> = {
    autofocus: true,
    showActionButtons: false,
    migratingFromQuill: true,
    iframe: true,
    placeholder: this.i18nService.translate('360.csm.field_editor.placeholderText')
  };

  froalaOptions: RteFroalaOptions | any = {
    toolbarButtons: {
      moreText: {
        buttons: ['bold', 'italic', 'textColor', 'backgroundColor', 'underline', 'strikeThrough', 'fontFamily', 'fontSize'],
        buttonsVisible: 4,
      },
    
      moreParagraph: {
        buttons: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL'],
        buttonsVisible: 4,
      },
    
      moreRich: {
        buttons: ['insertLink', 'clearFormatting'],
        buttonsVisible: 2,
      },
    },
    //{360.admin.font_family.arial}=Arial
    //{360.admin.font_family.times_new_roman}=Times New Roman
    //{360.admin.font_family.courier_new}=Courier New
    //{360.admin.font_family.arial_black}=Arial Black
    //{360.admin.font_family.arial_narrow}=Arial Narrow
    //{360.admin.font_family.tahoma}=Tahoma
    //{360.admin.font_family.verdana}=Verdana
    //{360.admin.font_family.georgia}=Georgia
    fontFamily: {
      "Arial, sans-serif": this.i18nService.translate('360.admin.font_family.arial'),
      "'Times New Roman', Times, serif": this.i18nService.translate('360.admin.font_family.times_new_roman'),
      "'Courier New', Courier, monospace": this.i18nService.translate('360.admin.font_family.courier_new'),
      "'Arial Black', sans-serif": this.i18nService.translate('360.admin.font_family.arial_black'),
      "'Arial Narrow', sans-serif": this.i18nService.translate('360.admin.font_family.arial_black'),
      "Tahoma, sans-serif": this.i18nService.translate('360.admin.font_family.tahoma'),
      "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif": this.i18nService.translate('360.admin.font_family.arial'),
      "Verdana, sans-serif": this.i18nService.translate('360.admin.font_family.verdana'),
      "Georgia, serif": this.i18nService.translate('360.admin.font_family.georgia'),
    },
    fontSize: ['10', '12', '14', '16', '18', '21', '24', '28', '32', '48'],
    iframeStyle: `
      body {
        font-size: 14px;
      }

      ul, ol { 
        padding-left: 40px !important;
      }

      p {
        margin: 0 !important;
      }

      body {
        padding-top: 8px;
      }
    `,
    toolbarInline: false,
  };

  @Input() nzEllipsisRows;
  @Input() treeData;
  @Input() isReadOnly;
  @Output() updateValue = new EventEmitter();
  @Output() editState = new EventEmitter();
  @Output() managedByData = new EventEmitter();
  inMini360: boolean;
  @ViewChild('rte', {static: false}) rte: GsRteComponent;
  constructor(public fqs: FilterQueryService,
    @Inject("envService") public _env: EnvironmentService,
    public _fb: FormBuilder,
    public portfolioWidgetService: PortfolioWidgetService,
    public i18nService: NzI18nService,
    private _ds: DescribeService,
    private attrService: CSMAttributeService,
    public userService: UserService,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    protected cdRef: ChangeDetectorRef
  ) {
      super(fqs, _env, _fb, portfolioWidgetService, userService, cdRef, i18nService);
      this.timeZone = this._env.user && this._env.user.locale && this._env.user.locale.timeZoneKey;
      this.inMini360 = isMini360(this.ctx);
  }

  onDocumentEvent(data) {
    if(!this.editable || this.field.dataType === DataTypes.RICHTEXTAREA) {
      return;
    }
    const event = data.nativeEvent as Event;
    const target = event.target as HTMLElement;
    switch (data.event) {
      case 'TAB_PRESSED':{
        event.stopImmediatePropagation();
        this.onInputBlur();
        break;
      }
      case 'ENTER_PRESSED': {
        this.onInputBlur();
        break;
      }
      case 'ESCAPE_PRESSED': {
        // Don't stop propagation when field is direct editable to enable escape events to reach other editable fields
        // Because: When we have direct editable fields in the grid, we don't mark them as editable false.
        // So, the next escape event will also be caught by this same field (because it is still in editable state)
        // And stopImmediatePropagation will not propagate the escape event to other fields (which are also in editable state).
        // So, when we have direct editable fields, we should not stop propagation. Otherwise the escape event will never reach other fields.
          if(this.prevFields) {
              this.isValueChanged  = true;
              this.valueChangedKey = this.prevFields.value.k + '';
          }
        if(!DIRECT_EDIT_TYPES.includes(this.field.dataType)) {
          event.stopImmediatePropagation();
        }
        this.onInputBlur(true);
        break;
      }
    }
  }

  onEscape(event) {
      // Triggering value changed with previous value on escape pressed
      if(this.prevFields) {
          this.isValueChanged  = true;
          this.valueChangedKey = this.prevFields.value.k + '';
      }
    event.preventDefault();
    event.stopImmediatePropagation();
    this.onInputBlur(true);
  }

  onEnter(event) {
    event.stopImmediatePropagation();
    // fix for Japanese character not updating on enter
    if(event && event.target) {
      this.formGroup.get(this.field.fieldName).setValue(event.target.value);
    }
    this.onInputBlur();
  }

  onTabPress(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.onInputBlur();
  }

  ngOnInit() {
    this.field = this.fields[0];
    if(this.field.fieldName === "ManagedBy"  &&  this.field.properties.required) {
      this.isManagedByRequired = true;
    }

    this.rteOptions = {
      ...this.rteOptions,
      onContentChanged: (value) => {
        this.onRTAContentChanged({
          text: value.content.replace(/(<([^>]+)>)/gi, ""),
          html: value.content
        }, this.field)
      }
    };

    if(DIRECT_EDIT_TYPES.includes(this.field.dataType)) {
      this.setEdit();
    }
  }

    calculateRteButtons() {
    const boundingRect = this.hostElement.nativeElement.getBoundingClientRect();
    const availableWidth: number = boundingRect.width;
    const buttonsVisible = Math.floor(((availableWidth/38)-4)/2);

    this.froalaOptions.toolbarButtons.moreText.buttonsVisible = buttonsVisible;
    this.froalaOptions.toolbarButtons.moreParagraph.buttonsVisible = buttonsVisible;

    this.froalaOptions.toolbarInline = this.inMini360 ?  false: boundingRect.height < 130;
      /**
       * For any container  of gs-rte/froala editor with overflow properties the
       * left position of the popup is not adjusted properly
       * So resetting the left position of the popup w.r.t the toolbar width
       */
    this.froalaOptions.events = {
      "commands.after": (cmd) => {
        // check if it is insert link popup
        if (this.rte && this.rte.editor && this.rte.editor.$tb && cmd == 'insertLink') {
          const toolBarElement: HTMLElement = this.rte.editor.$tb[0];
          const popupElement: HTMLElement = toolBarElement.querySelector('.fr-popup');
          const overflowWidth: number = (popupElement.offsetLeft + popupElement.offsetWidth) - toolBarElement.offsetWidth;
          const buffer:number = 2;
          // adjust position
          if (popupElement && overflowWidth && overflowWidth > 0) {
            popupElement.style.left =  popupElement.offsetLeft - overflowWidth - buffer + "px";// Adjust left position
          }
        }
      }
    }
  }


  ngOnChanges(changes) {
    this.field = this.fields[0];
    super.ngOnChanges(changes);
    // Using it while pressing escape to update the previous value
    this.prevFields = cloneDeep(this.field);
    this.isSaving = false;
      if(changes.treeData && changes.treeData.currentValue){
          this.checkIfMappingField();
      }
  }

  /**
   * @description Recursively get controlling fields of all dependencies
  */
  private getControllingFields(fields: any[], fieldName: string) {
    let controllingFields = fields.filter(f => f.data.meta.controllerName === fieldName);
    controllingFields = controllingFields.concat(...controllingFields.map(ctrlField => (this.getControllingFields(fields, ctrlField.data.fieldName))));
    return controllingFields;
  }

  public async checkIfMappingField(){
    // this.treeData = await this._ds.getObjectTree(MDA_HOST, Cs360ContextUtils.getBaseObjectName(this.ctx), 2, null, {skipFilter: true});
    let field = findFieldInTreeByFieldPath(
      this.field.dataType === "LOOKUP" ? this.field.lookupDisplayField : this.field, isEmpty(this.treeData) ? this.attrService.treeData:  this.treeData
      );
      if(field && field.data){
        this.field.meta = field.data && field.data.meta
      }
  }

  public async editField() {
    // Note: For multiObject in place of calling describe api we recieve childrens for object in treeData
    let data = {children:[]};
    if(this.ctx.associatedObjects && this.ctx.associatedObjects.length){
      data = isEmpty(this.treeData) ? this.attrService.treeData:  this.treeData;
    }else{
      data = await this._ds.getObjectTree(MDA_HOST, this.ctx.baseObject, 2, null, {skipFilter: true});
    }
    let field: any = findFieldInTreeByFieldPath(this.field, data);
    let controllingFields = this.getControllingFields(data.children, field.data.fieldName);

    
    let options = field.data.options;
    if (field.data.meta.controllerName) {
      try {
        // let resp = await this.attrService.getDependentPicklistValues(Cs360ContextUtils.getBaseObjectName(this.ctx), {
          let resp = await this.attrService.getDependentPicklistValues(this.ctx.baseObject, {
          "dependentFieldName": field.data.fieldName,
          "gsid": this.ctx.entityId,
          "controllerFieldName": field.data.meta.controllerName
        }).toPromise();
        options = resp.data;
      } catch (e) { }
    }
    
    try {
      this.field.meta = field.data.meta;
      this.field.options = options;
      this.dropdownOptions = this.field.options;
      this.field.controllingFields = controllingFields;
      this.field.controllingFieldLabels = controllingFields.map(item => item.label).join(", ");
      this.setDropdownOptions(this.field, this.field.value);
      let validator = null;
      validator = this.getValidators(this.field);
      const formControl:any = this.formGroup.get(this.field.fieldName);

      if (this.field.dataType === DataTypes.STRING && typeof formControl.value === 'string' ) {
        formControl.value = formControl.value.replace(/&#039;/g, "'");
      }

      formControl.setValidators(validator);
      if(this.resetValue) {
        this.formGroup.get(field.data.fieldName).setValue(null);
        this.resetValue = false;
      }
    } catch (e) {
      console.error(e);
    }

    this.calculateRteButtons();
    this.editState.emit(true);
  }

  subscribeToValueChanges() {
      // Setting the value here and emiiting the updated value on input blur
    this.formGroup.valueChanges.subscribe(formValue => {
      keys(formValue).forEach(key => {
          this.isValueChanged = true;
          this.valueChangedKey = formValue[key];
      })

      if(DIRECT_EDIT_TYPES.includes(this.field.dataType)) {
        this.onInputBlur();
      }
    });
  }

  onInputBlur(cancel?: boolean, enterValue?:any) {
    if(!this.formGroup.valid && (!cancel || typeof cancel !== "boolean")) {
      this.getValidationErrors();
      return;
    }
    // This will trigger once the form value is changed and user blurs/clicks outside the form field
    if(this.isValueChanged) {
      this.isValueChanged = false;
      let updatedData = {};
      const id = this.field.fieldName;
      updatedData[id] = this.getSelectedValue((enterValue || this.valueChangedKey), this.field);
      updatedData["field"] = this.field;
      if(this.field.dataType !== DataTypes.RICHTEXTAREA) {
          this.value = updatedData[id].fv;
      }
      this.valueChanged.emit(updatedData);
      if(this.field.dataType === DataTypes.URL) {
        this.isReadMode = true;
      }
    }

    if(this.field.dataType === DataTypes.RICHTEXTAREA) {
        const GS = this._env.gsObject;
        if(GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]){
          this.rtaText = formatUrlToLink(this.formGroup.get(this.field.fieldName).value);
        } else {
          this.rtaText = formatUrlToLink(unescape(this.formGroup.get(this.field.fieldName).value));
        }
    }
    
    if(!DIRECT_EDIT_TYPES.includes(this.field.dataType)) {
      this.editable = false;
      this.editState.emit(false);
    }
    
    // checking type of to enable outside click save
    if(!cancel || typeof cancel !== "boolean") {
      if(!this.field.controllingFields || !this.field.controllingFields.length) {
        this.isSaving = true;
      }
      this.updateValue.emit();
    } else {
      if(this.field.dataType === DataTypes.STRING) {
          if(this.fields[0].value.v){
              this.fields[0].value.fv = this.fields[0].value.v
          }
      }
      this.createFormGroup();
    }
  }

  async setEdit() {
    if(this.editable) {
      return;
    }
    await this.editField();
    this.editable = true;
    setTimeout(() => {
      this.openPopup = true;
      if(this.field.dataType === DataTypes.DATE || this.field.dataType === DataTypes.DATETIME || this.field.dataType === DataTypes.LOOKUP) {
        this.clickInput();
      }
    })
  }

  onDateTimePickerOpenChange(open) {
    if(!open) {
      this.onInputBlur();
    }
  }

  onClearClick(event: any, field: any) {
    event.stopPropagation();
    this.resetValue = true;
    this.setEdit();
  }

  onRTAClose(event: any) {
    this.onInputBlur(true);
    event.stopPropagation();
  }

  clickInput() {
    if(!!this.hostElement) {
      const inputElement = (this.hostElement.nativeElement.querySelector('input')) as HTMLElement;
      if(inputElement) {
        inputElement.click();
      }
    }
  }

  save(event: any) {
    event.stopPropagation();
    if (isEmpty(this._errors)) {
      this.onInputBlur();
    }
  }

  getLookupObject(field: WidgetField) {
    let objectName: string;
    if(field && field.meta) {
        if(field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0]) {
            objectName = field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0] && field.meta.lookupDetail.lookupObjects[0].objectName;
        } else {
            objectName = field.meta.mappings && field.meta.mappings.GAINSIGHT && MappingObjects[field.meta.mappings.GAINSIGHT.key];
        }
    } else {
        objectName = field.lookupDisplayField && field.lookupDisplayField.objectName;
    }
    return objectName;
  }
  setDisplayValue(field, value) {
    this.value = field.value && field.value.fv ? field.value.fv : "---";
    this.setDropdownOptions(field, value);
    const GS = this._env.gsObject;
      if(GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]){
        this.rtaText = this.value === "---" ? "" : formatUrlToLink(this.value);
      } else {
        this.rtaText = formatUrlToLink(unescape(this.value === "---" ? "" : this.value));
      }
    if(field.dataType === DataTypes.BOOLEAN) {
      this.value = this.value === "" ? this.i18nService.translate("360.csm.picklist.none") : this.value;
        PORTFOLIO_WIDGET_CONSTANTS.BOOLEAN_OPTIONS.map(opt => {
            isEqual(this.value, opt.value+'') ? this.value = this.i18nService.translate(opt.label): this.value = this.value;
        })
    }
  }

  getFormattedValue(value: any, field) {
    if(!this.editable) {
      this.setDisplayValue(field, value);
    }
    if(!value) {
      return "";
    }
    switch(field.dataType) {
      case DataTypes.PICKLIST:
        return field.value.k || "";
      case DataTypes.MULTISELECTDROPDOWNLIST:  
        const values = field.value && field.value.k ? field.value.k.split(";") : [];      
        return values;
      case DataTypes.BOOLEAN:
      return field.value.k;
      case DataTypes.CURRENCY:
        return field.value ? (!field.value.k && field.value.k !== 0 ? field.value.fv !== undefined ? field.value.fv : field.value : field.value.k) : '';
        case DataTypes.DATETIME:
        case DataTypes.DATE:
            if(!field.value || !field.value.k) {
                return null;
            }
            const GSObject = this._env.uiEnvironment;
            const timeZoneKey = GSObject.timeZoneKey;
            // Date time format with hypen not working in Safari, so passing date in slash format below to date picker
            return moment(field.value.k).tz(timeZoneKey, field.dataType === DataTypes.DATE).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_SLASH);

      case DataTypes.STRING:
        field.value.fv = purifyDomForString(field.value.fv);
        return field.value.fv;
      default: return field.value.k === undefined ? '' : field.value.k;
    }
  }

  onOptionSelected(open?: boolean, fieldData?: any) {
    if(fieldData && fieldData.selectedOption) {
      this.managedByData.emit(fieldData);
    }
    this.openPopup = open !== undefined ? open : !this.openPopup;
    this.popupClosed.emit(this.openPopup);
    this.onInputBlur();
  }

  getDisplayLabel(result, field): string {
    let displayLabel = "";
    switch(true) {
      case field.lookupDisplayField !== undefined:
        displayLabel = result ? result[field.lookupDisplayField.fieldName.toLowerCase()] : "";
        break;
      case field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.EMAIL:
        displayLabel = result.email;
        break;
      case field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.GSID:
        displayLabel = result.gsid;
        break;
      default:
        displayLabel = result.name;
        break;
    }
    return displayLabel;
  }

  getSelectedValue(value: any, field): InlineEditData {
    const selectedValue: InlineEditData = <any>{};
    let format = field.dataType === DataTypes.DATE ? this.dateFormat.toUpperCase() : this.dateFormat.toUpperCase() + " hh:mm A";
    const GSObject = this._env.uiEnvironment;
      const timeZoneKey = GSObject.timeZoneKey;
      // const momentTime = moment(value).tz(timeZoneKey);
      const timeZoneKaTime = moment(value).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT);
    if(value === undefined || value === null || value === "") {
      selectedValue.fv = "---";
      selectedValue.k = "";
      return selectedValue;
    }
    switch(field.dataType) {
      case DataTypes.PICKLIST:
        const selectedOption = this.dropdownOptions.find(option => option.value === value);
        selectedValue.fv = selectedOption ? selectedOption.label : "---";
        selectedValue.k = selectedOption ? selectedOption.value : null;
        break;
      case DataTypes.MULTISELECTDROPDOWNLIST:
        selectedValue.fv = "";
        selectedValue.k = [];
        if(field.options) {
          field.options.forEach(opt => {
            if(opt.selected) {
              selectedValue.fv += opt.label + ";";
              selectedValue.k.push(opt.value);
            }
          });
        }
        break;
      case DataTypes.BOOLEAN:
        (PORTFOLIO_WIDGET_CONSTANTS.BOOLEAN_OPTIONS as any[]).forEach(opt => {
          if(opt.value === value) {
            selectedValue.fv = opt.label;
            selectedValue.k = opt.value;
          }
        });
        break;
      case DataTypes.RICHTEXTAREA:
        selectedValue.k = value;
        selectedValue.fv = value;
        break;
      case DataTypes.STRING:
        selectedValue.k = value;
        selectedValue.fv = purifyDomForString(value);
        break;
      case DataTypes.URL:
        selectedValue.k = value ;
        selectedValue.fv = purifyDomForString(value);
        break;
      case DataTypes.CURRENCY:
        selectedValue.k = value;
        selectedValue.fv = field.value && field.value.p ? field.value.p + " " + value : value;
        break;
      case DataTypes.DATETIME:
        // Assume selected time is in given timezone (timeZoneKey), now convert from timeZoneKey to UTC
        selectedValue.k = moment.tz(timeZoneKaTime, timeZoneKey).utc().format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_WITH_TIMEZONE);
        selectedValue.fv = moment(value).format(format);
        break;
      case DataTypes.DATE:
        // Assume selected time is in given timezone (timeZoneKey), now convert from timeZoneKey to UTC
        selectedValue.k = moment.tz(timeZoneKaTime, timeZoneKey).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_WITH_TIMEZONE);
        selectedValue.fv = moment(value).format(format);
        break;
      case DataTypes.LOOKUP:
        const selectedResult = this.resultedItems.find(x => x.value === value);
        selectedValue.k = value;
        selectedValue.fv = this.getDisplayLabel(selectedResult, field);
        break;
      default: 
      selectedValue.fv = value ? value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : value;
      selectedValue.k = value ? value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : value;
      break;
    }
    return selectedValue;
  }

  getValidationErrors(event?){
    this._errors = getFormErrors(this.formGroup);
    this.formStatusUpdated.emit(this._errors);
    if (event && event.type === 'blur' && (!this._errors || Object.keys(this._errors).length === 0)) {
          this.isReadMode = true;
      }
  }

  tooltipVisible(evt:any){
    this.isTooltipVisible = evt;
  }

    openInNewTab(): void {
        const formControl:any = this.formGroup.get(this.field.fieldName);
        if (formControl && formControl.value) {
          const url = formControl.value.match(/^http[s]?:\/\//) ? formControl.value : 'http://' + formControl.value;
          window.open(url, '_blank');
        }
    }
    getFieldValue(field): string {
        const formControl:any = this.formGroup.get(field.fieldName);
        return formControl.value
    }

    setReadMode(value: boolean): void {
        this.isReadMode = value;
    }

}


@Directive({
  selector: '[input, nz-date-picker]',
  host: {'(blur)': 'onBlur($event)', '(nzBlur)': 'onBlur($event)'}
})
export class BlurForwarder {
  constructor(private elRef:ElementRef, private renderer:Renderer) {}

  onBlur($event) {
    this.renderer.invokeElementMethod(this.elRef.nativeElement, 
        'dispatchEvent', 
        [new CustomEvent('input-blur', { bubbles: true })]);
    // or just 
    // el.dispatchEvent(new CustomEvent('input-blur', { bubbles: true }));
    // if you don't care about webworker compatibility
  }
}

@Pipe({ name: "decodeData" , pure: false})
export class DecodeDataPipe implements PipeTransform {
  transform(data: any): any {
    if(typeof(data) === "string"){
      const inputString =  unescape(data);
      const decodedString = inputString.replace(/&#039;/g, "'");
      return decodedString;
    }
      return data;
  }
}
