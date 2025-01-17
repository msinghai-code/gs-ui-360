import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {keys, uniq, forEach, cloneDeep, isEmpty, includes, unescape} from 'lodash';
import { getFormErrors } from '@gs/gdk/services/formly';
import {
  formLookupSearchPayload,
  getLookupOnFieldForAutoSuggest,
  FilterQueryService,
  getFieldSearchDetails,
  AutoSuggestDetails
} from "@gs/gdk/filter/builder";
import {
  remapFields2tree
} from "@gs/gdk/utils/field";
import {
  DEFAULT_LOOKUP_SEARCH_FIELDS,
  DEFAULT_LOOKUP_SELECT_FIELDS
} from "@gs/gdk/core";
import { GSField } from "@gs/gdk/core";
// import {
//   DataTypes,
//   FieldEditorComponent,
//   getFieldId,
//   InlineEditData,
//   PORTFOLIO_WIDGET_CONSTANTS
// } from '../../../../../portfolio-lib';
import { DataTypes, PORTFOLIO_WIDGET_CONSTANTS, InlineEditData, FieldEditorComponent, getFieldId, PortfolioWidgetService } from '@gs/cs360-lib/src/portfolio-copy';
// import { PortfolioWidgetService } from '../../../../../portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service';
// import * as moment from "moment";
import * as moment_ from 'moment-timezone';
const moment = moment_;
import {EnvironmentService, UserService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { LookSearchConfig } from '@gs/gdk/lookup-search';

@Component({
  selector: 'gs-relationship-field-editor',
  templateUrl: './relationship-field-editor.component.html',
  styleUrls: ['./relationship-field-editor.component.scss']
})
export class RelationshipFieldEditorComponent extends FieldEditorComponent implements OnInit {

  @Input() data: any;

  public lookupResultItems: any = {};
  rteContents = {};
  managedByData: any = null;
  GSObj;

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
  
  constructor(
    public fqs: FilterQueryService,
    @Inject("envService") public _env: EnvironmentService,
    public _fb: FormBuilder,
    public portfolioWidgetService: PortfolioWidgetService,
    public ele : ElementRef,
    public userService: UserService,
    public i18nService: NzI18nService,
    protected cdRef: ChangeDetectorRef
  ) {
      super(fqs, _env, _fb, portfolioWidgetService, userService, cdRef);
  }
 
  ngOnInit() {
    super.ngOnInit();
    }


    rtatextEdit({
      value,
      field
    })
    {
        this.rteContents[field.fieldName] = value;
    }

  createFormGroup() {
    const formGroup = {};
    this.fields.forEach(field => {
      const value = this.data[field.fieldName];
      const formattedValue = this.getFormattedValue(value, field);
      this.GSObj = this._env.gsObject;
      if(field.dataType === DataTypes.LOOKUP && value && value.k) {

        this.lookupResultItems[field.fieldName] = [{
          displayLabel: formattedValue,
          value: value.k
        }];

        formGroup[field.fieldName] = [{value: value.k, disabled: this.GSObj.featureFlags['FIELD_LEVEL_PERMISSIONS']? !field.properties.editable: !field.editable}];
          if(field.fieldName === 'ManagedBy') {
              this.managedByOptions.objDetails[0].searchConfig.value = value.k;
              formGroup[field.fieldName] = [{value: value.k, disabled: false}];
          }
          if(field.fieldName === 'CompanyId') {
              // companyId needs to be disabled in all cases everytime
              formGroup[field.fieldName] = [{value: value.k, disabled: true}];
          }
        return;
      }

      if(!this.editable) {
        formGroup[field.fieldName] = [{value: formattedValue, disabled: false}];
      } else {
        let validator = null;
        validator = this.getCustomValidators(field);
        formGroup[field.fieldName] = [{value: formattedValue, disabled: this.GSObj.featureFlags['FIELD_LEVEL_PERMISSIONS']? !field.properties.editable: !field.editable}, validator];
      }
    })
    this.formGroup = this._fb.group(formGroup);
    this._errors = getFormErrors(this.formGroup);
    this.formGroup.statusChanges.subscribe(v => {
      this._errors = getFormErrors(this.formGroup);
      this.formStatusUpdated.emit(this._errors);
    });
    this.formGroup.valueChanges.subscribe(formValue => {
      if(!formValue.hasOwnProperty('ManagedBy')) {
        for(let currentField of this.fields) {
          if(currentField.fieldName === 'ManagedBy') {
            formValue['ManagedBy'] = "";
          }
        }
      }
      const updatedData = {};
      keys(formValue).forEach(key => {
        const field = this.fields.find(f => f.fieldName === key);
        const id = getFieldId(field);
        updatedData[id] = this.getSelectedValue(formValue[key], field);
        if (id === 'ManagedBy' && this.managedByData && !this.managedByData.data) {
          updatedData[id] = {fv: "---", k: "", v: ""};
        } else if(id === 'ManagedBy'  &&  this.managedByData  &&  this.managedByData.selectedOption) {
          updatedData[id] = {k: this.managedByData.selectedOption.value, fv: this.managedByData.selectedOption.displayValue};
        }
        this.updatedData = {
          ...this.updatedData,
          [id] : updatedData[id].k
        }
      })
      this.valueChanged.emit(updatedData);
    });

  }

  protected getCustomValidators(field): any[] {
    const validator = this.getValidators(field);
    return validator;
  }


  onSearchResponse(results: any[], field: any) {
    forEach(results, result => {
      if(field.properties && field.properties.SEARCH_CONTROLLER && field.properties.SEARCH_CONTROLLER.fields.length > 0) {
        result.displayLabelObject = result;
      }

      result.displayLabel = this.getDisplayLabel(result, field);
      result.value = this.getLookupValue(result, field);
    });
    this.lookupResultItems[(field.fieldName || field.data.fieldName)] = results;
    field.searching = false;
  }

  getLookupValue(result, field) {
    const key = field.meta.lookupDetail.fieldName.toLowerCase();
    return result[key];
  }

  getDisplayLabel(result, field): string {
    if(field.dataType === DataTypes.LOOKUP && field.lookupDisplayField) {
      return result[field.lookupDisplayField.fieldName.toLowerCase()];
    }

    let displayLabel = "";
    switch (true) {
      case field.data && field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.EMAIL:
      case field.meta && field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.EMAIL:
        displayLabel = result ? result.email: "";
        break;
      case field.data && field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.GSID:
      case field.meta && field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.GSID:
        displayLabel = result ? result.gsid: "";
        break;
      default:
        displayLabel = result ? result.name: "";
        break;
    }
    return displayLabel;
  }

  protected setDropdownOptions(field: GSField, value: any) {
    if (field.dataType === DataTypes.BOOLEAN) {
      field.options = (PORTFOLIO_WIDGET_CONSTANTS.BOOLEAN_OPTIONS as any[]).map(opt => {
        opt.label = this.i18nService.translate(opt.label);
        opt.selected = value !== undefined && opt.value === value.fv;
        return opt;
      });
    } else if (field.options && field.dataType === DataTypes.MULTISELECTDROPDOWNLIST) {
      const values = value && value.k ? value.k.split(";") : [];
      field.options = field.options.map(opt => {
        opt.selected = includes(values, opt.value);
        return opt;
      });
    }
  }

  getFormattedValue(value: any, field) {
    if (!this.editable) {
      this.value = field.value === "NULL" ? "---" : field.value;
      if (field.dataType === DataTypes.BOOLEAN) {
        this.value = this.value === "" ? "None" : this.value;
      }
      return field.value;
    }
    this.setDropdownOptions(field, value);
    if (!value) {
      return "";
    }
    switch (field.dataType) {
      case DataTypes.PICKLIST:
        return value.k || value || "";
      case DataTypes.MULTISELECTDROPDOWNLIST:
        const values = value && value.k ? value.k.split(";") : [];
        return values;
      case DataTypes.BOOLEAN:
      case DataTypes.NUMBER:
      case DataTypes.PERCENTAGE:
        return value.k;
      case DataTypes.CURRENCY:
        return value ? (!value.k && value.k !== 0 ? value.fv !== undefined ? value.fv : value : value.k) : '';
      case DataTypes.DATETIME:
      case DataTypes.DATE:
        if (!value || !value.k) {
          return null;
        }
        // return new Date(value.k); // using v instead of k property to balance the timezone diff.
          const GSObject = this._env.uiEnvironment;
          const timeZoneKey = GSObject.timeZoneKey;
          // Date time format with hypen not working in Safari, so passing date in slash format below to date picker
          return moment(value.k).tz(timeZoneKey, field.dataType === DataTypes.DATE).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_SLASH);
      case DataTypes.LOOKUP:
        return value.fv || '';
      case DataTypes.RICHTEXTAREA:
        const GS = this._env.gsObject;
        if(GS.featureFlags['CR360_TEXT_DATA_DECODING_DONE']){
          return value = value.k || " ";
        } else {
          return value = decodeURIComponent(value.fv || " ");
        } 
      default: return value.v || '';
    }
  }

  getSelectedValue(value: any, field): InlineEditData {
    const selectedValue: InlineEditData = <any>{};
    if (value === undefined || value === null) {
      selectedValue.fv = "---";
      selectedValue.k = "";
      selectedValue.v = "";
      return selectedValue;
    }
    switch (field.dataType) {
      case DataTypes.PICKLIST:
        const selectedOption = field.options && field.options.find(option => option.value === value);
        selectedValue.fv = selectedOption ? selectedOption.label : "---";
        selectedValue.k = selectedOption ? selectedOption.value : null;
        break;
      case DataTypes.MULTISELECTDROPDOWNLIST:
        selectedValue.fv = "";
        selectedValue.k = [];
        if (field.options) {
          field.options.forEach(opt => {
            if (opt.selected) {
              selectedValue.fv += opt.label + ";";
              selectedValue.k.push(opt.value);
            }
          });
        }
        if(selectedValue.k.length === 0) {
          selectedValue.k = null;
        }
        break;
      case DataTypes.BOOLEAN:
        (PORTFOLIO_WIDGET_CONSTANTS.BOOLEAN_OPTIONS as any[]).forEach(opt => {
          if (opt.value === value) {
            selectedValue.fv = opt.label;
            selectedValue.k = opt.value;
          }
        });
        break;
      case DataTypes.CURRENCY:
        selectedValue.k = value;
        selectedValue.fv = field.value && field.value.p ? field.value.p + " " + value : value;
        break;
      case DataTypes.DATETIME:
      case DataTypes.DATE:
        let format = field.dataType === DataTypes.DATE ? this.dateFormat : this.dateFormat.toUpperCase() + " hh:mm a";
        const GSObject = this._env.uiEnvironment;
        const timeZoneKey = GSObject.timeZoneKey;
          selectedValue.k = !!value ? moment(value).tz(timeZoneKey, true).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_WITH_TIMEZONE): '';
          selectedValue.fv = !!value ? moment(value).format(format): '';
        break;
      case DataTypes.LOOKUP:
        if(this.lookupResultItems[field.fieldName]) {
          const selectedResult = this.lookupResultItems[field.fieldName].find(x => x.value === value);
          selectedValue.k = value;
          selectedValue.fv = this.getDisplayLabel(selectedResult, field);
        }
        break;
      case DataTypes.RICHTEXTAREA:
        const GS = this._env.gsObject;
        if(GS.featureFlags['CR360_TEXT_DATA_DECODING_DONE']){
          selectedValue.k =  value;
          selectedValue.fv = value;
        } else {
          selectedValue.k =  encodeURIComponent(value);
          selectedValue.fv = encodeURIComponent(value);
        } 
         break;
      default:
        selectedValue.fv = value;
        selectedValue.k = value;
        selectedValue.v = value;
        break;
    }
    return selectedValue;
  }

  serialize() {
    this.updateRteFormControls();
    this.submitForm();
    if(isEmpty(this._errors)) {
      return {
        data: this.updatedData,
        error: false
      };
    } else {
      return {
        data: this._errors,
        error: true
      };
    }
  }

  updateRteFormControls() {
    Object.keys(this.rteContents).forEach(fieldName => {
      const field = this.fields.find(f => f.fieldName === fieldName);
      if(field) {
        this.onRTAContentChanged({ 
          text: this.rteContents[fieldName].content.replace(/(<([^>]+)>)/gi, ""),
          html: this.rteContents[fieldName].content
        }, field) 
      }
    })
  }

  submitForm(): void {
    for (const i in this.formGroup.controls) {
      this.formGroup.controls[i].markAsDirty();
      this.formGroup.controls[i].updateValueAndValidity();
    }
  }

  onSelectOptionSelected(field: any, fieldData?: any) {
    if(fieldData && fieldData.selectedOption) {
      this.managedByData = fieldData
    }
    field.openPopup = !field.openPopup;
    this.portfolioWidgetService.setFieldSelectedForEdit(null);
    this.popupClosed.emit(field.openPopup);
  }

  onSelectPopupClosed(isDropdownOpen: boolean, field: any) {
    if(!isDropdownOpen) {
      this.onSelectOptionSelected(field);
    }
  }

  save() {
    // console.log("Outside Clicked");
    // if (isEmpty(this._errors)) {
    //   this.outsideClicked.emit(this.updatedData);
    // }
  }

  onPopupClosed() {}

}
