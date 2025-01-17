import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Inject,
  Output,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { GSField } from "@gs/gdk/core";
import { extraSpaceValidator, extraSpaceValidatorHTML } from '@gs/gdk/utils/common';
import { getFormErrors, getValidator } from '@gs/gdk/services/formly';
import { Subject } from 'rxjs';
import includes from "lodash/includes";
import keys from "lodash/keys";
import forEach from "lodash/forEach";
import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";
import get from "lodash/get";
import * as moment from 'moment';
// import * as datefns from 'date-fns-tz';
import { debounceTime, map, filter } from 'rxjs/operators';
import {DataTypes, MappingObjects} from '../pojos/portfolio-enums';
import { PortfolioWidgetService } from '../portfolio-widget-grid/portfolio-widget.service';
import { FieldEditorValueChangeInfo, InlineEditData, WidgetField } from '../pojos/portfolio-interfaces'
import { PORTFOLIO_WIDGET_CONSTANTS } from '../pojos/portfolio.constants';
import { getFieldId } from '../portfolio-widget-utils';
import { validateURL } from "@gs/gdk/utils/validators";
import { EnvironmentService, UserService } from '@gs/gdk/services/environment';
import {
  FilterQueryService,
} from "@gs/gdk/filter/builder";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { purifyDomForString } from "../purify/domutils"
import { LookSearchConfig } from '@gs/gdk/lookup-search';

interface SearchInfo {
  searchTerm: string;
  field: WidgetField;
}

@Component({
  selector: 'gs-field-editor',
  templateUrl: './field-editor.component.html',
  styleUrls: ['./field-editor.component.scss']
})
export class FieldEditorComponent implements OnInit, AfterViewInit, OnChanges {

  constructor(
      public fqs: FilterQueryService,
      @Inject("envService") public _env: EnvironmentService,
      public _fb: FormBuilder,
      public portfolioWidgetService: PortfolioWidgetService,
      public userService: UserService,
      protected cdRef: ChangeDetectorRef,
      public i18nService?: NzI18nService
  ) {
    this.dateFormat = this.getUserConfigByHostType() && this.getUserConfigByHostType().locale
        ? this.getUserConfigByHostType().locale.dateFormat
        : 'M/d/yyyy';
    this.dateTimeFormat = `${this.dateFormat} hh:mm a`;
  }
  
  @ViewChild('hostElement', { static: false }) hostElement: ElementRef;

  @ViewChild('editableInputElem', {static: false}) editableInputElem: ElementRef;
  
  @Input() fields: WidgetField[];
  @Input() editable: boolean;
  @Input() gridInlineEditEnabled = false;
  @Input() showLabel: boolean;
  @Input() defaultOpenPopups: boolean = false;
  @Input() showErrors: boolean;

  @Output() popupClosed = new EventEmitter();
  @Output() valueChanged = new EventEmitter<FieldEditorValueChangeInfo>();
  @Output() formStatusUpdated = new EventEmitter();

  updatedData: {};
  dateFormat: string;
  dateTimeFormat: string;
  formGroup: FormGroup;
  openPopup: boolean;
  _errors: any;
  dropdownOptions: any[];
  rtaText: any;
  dataType: string;
  searching = false;
  searchInputSubject = new Subject<SearchInfo>();
  resultedItems = [];
  value: any;

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

  ngOnInit() {
    this.createFormGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.fields) {
      this.createFormGroup(); 
    }
  }

  createFormGroup() {
    const formGroup = {};
    this.fields.forEach(field => {
      if(!this.editable) {
        formGroup[field.fieldName] = [{value: this.getFormattedValue(field.value, field), disabled: false}];
      } else {
        let validator = null;
        validator = this.getValidators(field);
        formGroup[field.fieldName] = [{value: this.getFormattedValue(field.value, field), disabled: false}, validator];
      }
    })
    this.formGroup = this._fb.group(formGroup);
    this._errors = getFormErrors(this.formGroup);
    this.formGroup.statusChanges.subscribe(v => {
      this.getValidationErrors();
    });
    this.subscribeToValueChanges();
  }

  getValidationErrors(){
    this._errors = getFormErrors(this.formGroup);
    this.formStatusUpdated.emit(this._errors);
  }
  
  subscribeToValueChanges() {
    this.formGroup.valueChanges.subscribe(formValue => {
      const updatedData = {};
      keys(formValue).forEach(key => {
        const field = this.fields.find(f => f.fieldName === key);
        const id = getFieldId(field);
        updatedData[id] = this.getSelectedValue(formValue[key], field);
      })
      this.valueChanged.emit({...updatedData, valid: this.formGroup.valid});
    });
  }

  onRTAContentChanged(value, field) {
    if(value.text.replace(/(\r\n|\n|\r)/gm, "").replace(/ /g,'')) {
      this.formGroup.get(field.fieldName).setValue(value.html);
    } else {
      this.formGroup.get(field.fieldName).setValue('');
    }
  }

  onRTAClose(event: any) {
    this.popupClosed.emit();
  }

  save(event: any) {
    if (isEmpty(this._errors)) {
      this.editable = false;
      this.popupClosed.emit(this.updatedData);
    }
  }

  protected getValidators(field): ValidatorFn[] {
    if(field.dataType === DataTypes.URL) {
      const validators = [];
      if (field.meta.required || (field.properties && field.properties.required)) {
        validators.push(Validators.required, extraSpaceValidator);
      }
      // validators.push(getUrlValidator.bind(this));
      validators.push(validateURL);
      return validators;
    } else if(field.dataType === DataTypes.LOOKUP) {
      if (field.meta.required || (field.properties && field.properties.required)) {
        return [Validators.required];
      }
    } else {
      const validators =  getValidator(field, {}, false);
      if (field.meta.required || (field.properties && field.properties.required)) {
        if([DataTypes.STRING, DataTypes.EMAIL].includes(field.dataType)) {
          validators.push(extraSpaceValidator);
          // validators.push(validateEmail);
        }
        
        if(field.dataType === DataTypes.RICHTEXTAREA) {
          validators.push(extraSpaceValidatorHTML);
        }
      }
      
      if([DataTypes.NUMBER, DataTypes.CURRENCY, DataTypes.PERCENTAGE].includes(field.dataType)) {
        validators.push(Validators.min(-1e+18));
        validators.push(Validators.max(1e+18));
      }
      return validators;
    }
  }

  ngAfterViewInit() {
   this.searchInputSubject
     .pipe(
       filter(val => val.searchTerm.length >= 1),
       map(v => {
        this.resultedItems = [];
        return v;
       }),
       debounceTime(500)
     )
     .subscribe(fieldInfo => {
       this.searching = true;
       fieldInfo.field.searching = true;
       this.cdRef.markForCheck();
       this.searchLookupField(fieldInfo);
     });
     this.openPopup = this.defaultOpenPopups;

     setTimeout(() => {
       if (this.editableInputElem && this.editableInputElem.nativeElement) {
         this.editableInputElem.nativeElement.focus();
       }
     });
  }

  searchLookupField(searchInfo: SearchInfo) {
        const term = (searchInfo.searchTerm || '').trim();
        const field = searchInfo.field;
        if (term.length >= 1) {
          const query = [
            {
              selectFields: this.getSearchableFields(field, true),
              searchFields: this.getSearchableFields(field),
              value: [term],
              operator: 'CONTAINS',
              useDBName: false,
              object: this.getLookupObject(field),
              source: "MDA",
              dataStore: "HAPOSTGRES",
              connectionId: null
            }
          ];
          if (this.getLookupObject(field) === 'gsuser') {
            try {
              query[0].selectFields.push('IsActiveUser');
              return this.fqs.search(query).pipe(map(v => {
                if (v && v.length) {
                  v = v.filter(x => x.isactiveuser);
                }
                return v;
              })).subscribe(response => this.onSearchResponse(response, field));
            } catch (e) {
              query[0].selectFields = ['Name', 'Gsid'];
              return this.fqs.search(query).subscribe(response => {
                this.onSearchResponse(response, field);
              })
            }
          }
          else
            this.fqs.search(query).subscribe(response => this.onSearchResponse(response, field));
        }
  }

  /**
   * 
   * @param field 
   * @param includeSelect 
   * @returns array of fields -> fields to search on AND fields to select (if includeSelect is true)
   * -=> fields to search on: 
   *     -> if exists => field.properties.SEARCH_CONTROLLER.fields 
   *     -> (ELSE) if exists => 'Name' field on lookup object
   *       -> 'Email' if field.meta.originalDataType is Email
   *     -> (ELSE) field.meta.lookupDetail (for custom lookups) -> last option (when there are no fields to search on)
   * -=> fields to select (bring data)
   *     -> 'Gsid' for sure
   *     -> if exists => field.lookupDisplayField
   *     -> if exists => field.meta.lookupDetail (for custom lookups)
   *     -> all 'fields to search' (above)
   */
  getSearchableFields(field: any, includeSelect = false): string[] {
    const fieldsToReturn = [];
    if(includeSelect) {
      fieldsToReturn.push('Gsid');
      
      if(field.lookupDisplayField) {
        fieldsToReturn.push(field.lookupDisplayField.fieldName);
      }
  
      if(field.meta && field.meta.lookupDetail && field.meta.lookupDetail.fieldName) {
        fieldsToReturn.push(field.meta.lookupDetail.fieldName);
      }
    }

    // In relationship field editor -> it is present in field.meta.properties, at other places is is under field.properties
    const searchController = get(field, 'properties.SEARCH_CONTROLLER.fields') || get(field, 'meta.properties.SEARCH_CONTROLLER.fields');
    if(searchController && searchController.length) {
      fieldsToReturn.push(...searchController);
    }
    else if (includes(PORTFOLIO_WIDGET_CONSTANTS.NAME_SEARCHABLE_FIELD_NAMES, this.getLookupObject(field))) {
      if (field.meta.originalDataType && field.meta.originalDataType.toUpperCase() === DataTypes.EMAIL) {
        fieldsToReturn.push('Email');
      }
      fieldsToReturn.push('Name');
    } else if(field.meta && field.meta.lookupDetail && field.meta.lookupDetail.fieldName) {
      fieldsToReturn.push(field.meta.lookupDetail.fieldName);
    }

    return uniq(fieldsToReturn);
  }

  onSearchResponse(results: any[], field: GSField) {
    forEach(results, result => {
      if(field.properties && field.properties.SEARCH_CONTROLLER && field.properties.SEARCH_CONTROLLER.fields.length > 0) {
        result.displayLabelObject = result;
      }
      result.displayLabel = this.getDisplayLabel(result, field);
      if(field.meta && field.meta.lookupDetail && field.meta.lookupDetail.fieldName) {
        result.value = result[field.meta.lookupDetail.fieldName.toLowerCase()]
      } else {
        result.value = result.gsid;
      }
    });
    this.resultedItems = results;
    this.searching = false;
    this.cdRef.markForCheck();
  }

  /**
   * 
   * @param result 
   * @param field 
   * @returns the display value from the object 'result' where 'key/property' would be:
   * => If exists -> 'Name' field
   * OR
   * => field.meta.lookupDetail.fieldName
   * TODO: Refactor it! Comments are incomplete
   */
  protected getDisplayLabel(result, field): string {
    let displayLabel = "";
    switch(true) {
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

    if(!displayLabel && field.meta && field.meta.lookupDetail && field.meta.lookupDetail.fieldName) {
      return result[field.meta.lookupDetail.fieldName.toLowerCase()];
    }
    return displayLabel;
  }

  onOptionSelected(open?: boolean, fieldData?: any) {
    if(fieldData && fieldData.selectedOption) {
      let updatedData = { ManagedBy: {fv: fieldData.selectedOption.displayValue, k: fieldData.selectedOption.value} };
      this.valueChanged.emit(updatedData);
    }
    this.openPopup = open !== undefined ? open : !this.openPopup;
    this.portfolioWidgetService.setFieldSelectedForEdit(null);
    this.popupClosed.emit(this.openPopup);
  }

  /**
   * Get user config details.
   */
  private getUserConfigByHostType(): any {
    return !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this._env.user;
  }
  
  onPopupClosed(isDropdownOpen?: boolean, data?: any) {
    isDropdownOpen = isDropdownOpen === null ? data.open : isDropdownOpen;
    if(!isDropdownOpen) {
      this.onOptionSelected(isDropdownOpen);
    }
  }

  getFormattedValue(value: any, field) {
    if(!this.editable) {
      this.value = field.value === "NULL" ? "---" : field.value;
      if(field.dataType === DataTypes.BOOLEAN) {
        this.value = this.value === "" ? "None" : this.value;
      }
      return field.value;
    }
    this.setDropdownOptions(field, value);
    if(!value) {
      return "";
    }
    switch(field.dataType) {
      case DataTypes.PICKLIST:
        return value.k || "";
      case DataTypes.MULTISELECTDROPDOWNLIST:
        const values = value && value.k ? value.k.split(";") : [];
        return values;
      case DataTypes.BOOLEAN:
      return value.fv;
      case DataTypes.CURRENCY:
        return value ? value.k : '';
      case DataTypes.DATETIME:
      case DataTypes.DATE:
        if(!value || !value.k) {
          return null;
        }
        const GSObject = this._env.uiEnvironment;
        const timeZoneKey = GSObject.timeZoneKey;
        // Date time format with hypen not working in Safari, so passing date in slash format below to date picker
        return moment(value.k).tz(timeZoneKey, field.dataType === DataTypes.DATE).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_SLASH);
         default: return value ? value.fv : '';
    }
  }

  protected setDropdownOptions(field: GSField, value: any) {
    if(field.dataType === DataTypes.BOOLEAN) {
      this.dropdownOptions = (PORTFOLIO_WIDGET_CONSTANTS.BOOLEAN_OPTIONS as any[]).map(opt => {
        opt.label = this.i18nService.translate(opt.label);
        opt.selected = value !== undefined && opt.value === value.k;
        return opt;
      });
    } else if(field.options && field.dataType === DataTypes.MULTISELECTDROPDOWNLIST) {
      const values = value && value.k ? value.k.split(";") : [];
      this.dropdownOptions = field.options.map(opt => {
        opt.selected = includes(values, opt.value);
        if(opt.active) {
          return opt;
        }
      }).filter(opt => opt);
    } else if(field.options && field.dataType === DataTypes.PICKLIST) {
      this.dropdownOptions = field.options.map(opt => {
        if(opt.active) {
          return opt;
        }
        //{360.csm.picklist.none}=None
      }).filter(opt => opt) || [];
      if(!this.dropdownOptions.find(opt => opt.label === "None") && field.fieldName !== 'CurrencyIsoCode') {
        this.dropdownOptions.push({label: this.i18nService.translate('360.csm.picklist.none'), value: null, active: true});
      }
    }
  }

  getSelectedValue(value: any, field): InlineEditData {
    const selectedValue: InlineEditData = <any>{};
    let format = field.dataType === DataTypes.DATE ? this.dateFormat.toUpperCase() : this.dateFormat.toUpperCase() + " hh:mm A";
    // NOTE: Add this back when moment is replaced by date-fns
    // format = format.replace(/Y/g, "y").replace(/D/g, "d");
    const GSObject = this._env.uiEnvironment;
    const timeZoneKey = GSObject.timeZoneKey;
    const timeZoneKaTime = moment(value).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT);
    if(value === undefined || value === null) {
      selectedValue.fv = "---";
      selectedValue.k = "";
      return selectedValue;
    }
    switch(field.dataType) {
      case DataTypes.PICKLIST:
        const selectedOption = field.options.find(option => option.value === value);
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
      case DataTypes.CURRENCY:
        selectedValue.k = value;
        selectedValue.fv = field.value ? field.value.p + " " + value : value;
        break;
      case DataTypes.DATETIME:
         // Assume selected time is in given timezone (timeZoneKey), now convert from timeZoneKey to UTC

        // IMP: Refer the NOTE in the function regarding format while replacing this with date-fns

          selectedValue.k = moment.tz(timeZoneKaTime, timeZoneKey).utc().format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_WITH_TIMEZONE);
          selectedValue.fv = moment(value).format(format);
          break;
      case DataTypes.DATE:
        // Assume selected time is in given timezone (timeZoneKey), now convert from timeZoneKey to UTC

        // IMP: Refer the NOTE in the function regarding format while replacing this with date-fns

          selectedValue.k = moment.tz(timeZoneKaTime, timeZoneKey).format(PORTFOLIO_WIDGET_CONSTANTS.DATE_TIME_FORMAT_WITH_TIMEZONE);
          selectedValue.fv = moment(value).format(format);
        break;
      case DataTypes.STRING:
        selectedValue.k = value;
        selectedValue.fv = purifyDomForString(value);
        break;
      case DataTypes.URL:
        selectedValue.k = value;
        selectedValue.fv = purifyDomForString(value);
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
  
  getLookupObject(field: WidgetField) {
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

}
