import * as moment from 'moment-timezone';
import { assign,filter,find,forEach,isEqual,map,size, unescape } from 'lodash';
import { Component,EventEmitter,Inject,Input,OnDestroy,OnInit,Output,ViewChild} from '@angular/core';
import { DataTypes, DATE_TIME_FORMAT, DATE_TIME_FORMAT_WITH_TIMEZONE, DATE_FORMAT, CURRENCYISOCODE_FIELD_NAME } from '../company-operations/constants';
import { getFormErrors, getValidator } from '@gs/gdk/services/formly';
import { DateUtils } from "@gs/gdk/utils/date";
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompanyUpsertUtils } from '../company-operations/CompanyUpsertUtils';
import { EnvironmentService } from '@gs/gdk/services/environment';
import {NzI18nService} from "@gs/ng-horizon/i18n";

interface UpsertInfo {
  objectDefinition: UpsertObjectDefinition;
  objectName: string;
  recordId: string;
  editable: boolean;
  data: any[];
  editsAllowed: any[];
  error?: any;
  message?: any;
  schema?: any;
}

interface UpsertObjectDefinition {
  objectName: string;
  sections: {
      objectName: string;
      source : string;
      label: string;
      columns: {
          attributes: any[]
      }[]
  };
}
@Component({
  selector: 'gs-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})

export class UpsertComponent implements OnInit, OnDestroy {

  @Input() upsertInfo: UpsertInfo;
  @ViewChild('stepper', { static:true }) stepper;
  @Input() submitLabel: string;
  @Input() set showLoading(loading: boolean){
    this.loading = loading;
  }

  @Output() updatedObject = new EventEmitter<any>();
  @Output() cancelClick = new EventEmitter<any>();

  loading = false;
  currentNextLabel: string;
  currencyCode: string;
  objectName: string;
  stepLabels: string[] = [];
  data: any;
  selectedStep = 0;
  errors: any;
  isLinear: boolean;
  allFields: any[] = [];
  formsInfo: { fields: any[], formGroup: FormGroup, errors: any}[] = [];
  showSidebar: boolean;
  private nextLabel = this.i18nService.translate('360.upsert_comp.next');
  private subscriptions: Subscription[] = [];

  constructor( private _fb: FormBuilder, @Inject("envService") private _env: EnvironmentService,private i18nService: NzI18nService) { }

  ngOnInit() {
    this.stepLabels = map(this.upsertInfo.objectDefinition.sections, 'label');
    this.currentNextLabel = size(this.stepLabels) > 1 ? this.nextLabel : this.submitLabel; 
    forEach(this.upsertInfo.objectDefinition.sections, section => {
      this.formsInfo.push(this.getFormInfo(section));
    });
    this.showSidebar = true;
  }

  private getFormInfo(section: any): { fields: any[], formGroup: FormGroup, errors: any} {
    const fields = [];
    map(section.columns, column => fields.push(...column.attributes));
    this.allFields = this.allFields.concat(fields);
    const formGroup = {};
    forEach(fields, field => {
      formGroup[field.fieldName] = [{value: this.getValue(field), disabled: this.isFieldDisabled(field)}, this.getValidators(field)];
      if(field.fieldName.toLowerCase() === CURRENCYISOCODE_FIELD_NAME && (this.upsertInfo.data[field.fieldName] && this.upsertInfo.data[field.fieldName].value)) {
        this.currencyCode = this.upsertInfo.data[field.fieldName].value;
      }
      if(field.meta.dependentPicklist && field.meta.controllerName) {
        field.controllerField = this.allFields.find(x => x.fieldName === field.meta.controllerName);
        field.controllerValue = this.getValue(field.controllerField);
      }
    });
    const form = this._fb.group(formGroup);
    this.subscriptions[this.subscriptions.length] = form.statusChanges.subscribe(v => {
      const formInfo = find(this.formsInfo, info => isEqual(info.formGroup, form));
      formInfo.errors = getFormErrors(form);
    });
    return {fields: fields, formGroup: form, errors: {}};
  }

  onPicklistUpdated(updatedField: any) {
    const dependentPicklists = this.allFields.filter(field => field.controllerField && field.controllerField.fieldName === updatedField.fieldName); 
    forEach(dependentPicklists, picklist => {
      forEach(this.upsertInfo.objectDefinition.sections, (section, idx) => {
        const field = this.formsInfo[idx].fields.find(field => field.fieldName === picklist.fieldName);
        if(field) {
          this.formsInfo[idx].formGroup.get(field.fieldName).reset();
          this.onPicklistUpdated(field);
        }
      })
    });
  }

  onCurrencyCodeUpdated(code: string) {
    this.currencyCode = code;
  }

  private isFieldDisabled(field) {
    return this.upsertInfo.editsAllowed[field.fieldName] === undefined ? false : !this.upsertInfo.editsAllowed[field.fieldName];
  }

  private getValue(field) {
    const conf = this._env.uiEnvironment;
    switch(field.dataType) {
      case DataTypes.PICKLIST:
        return (this.upsertInfo.data[field.fieldName] && this.upsertInfo.data[field.fieldName].value) || "";
      case DataTypes.MULTISELECTDROPDOWNLIST: 
        if(this.upsertInfo.data[field.fieldName] && this.upsertInfo.data[field.fieldName].length) {
          return map(this.upsertInfo.data[field.fieldName], "value");
        }
        return "";
      case DataTypes.DATETIME:
      case DataTypes.DATE:
        if(!this.upsertInfo.data[field.fieldName]) {
          return null;
        }
        if (field.dataType === DataTypes.DATETIME) {
          const tVal =
            DateUtils.utc2Local(
              this.upsertInfo.data[field.fieldName],
              DATE_TIME_FORMAT,
              conf.timeZoneKey
            ) + '';
          return new Date(tVal);
        } else {
          const tVal =
            DateUtils.utc2Local(
              this.upsertInfo.data[field.fieldName],
              DATE_TIME_FORMAT
            ) + '';
          return new Date(tVal);
        }
      case DataTypes.RICHTEXTAREA:
          const GS = this._env.gsObject;
          if(GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]){
            return this.upsertInfo.data[field.fieldName] || '';
          } else {
            return unescape(this.upsertInfo.data[field.fieldName]) || '';
          }
      case DataTypes.BOOLEAN:
        return this.upsertInfo.data[field.fieldName] === undefined ? '' : this.upsertInfo.data[field.fieldName];
      default: return this.upsertInfo.data[field.fieldName] || '';
    }
  }

  private getValidators(field): ValidatorFn[] {
    if(field.dataType === DataTypes.URL) {
      const validators = [];
      if (field.meta.required || (field.properties && field.properties.required)) {
        validators.push(Validators.required);
      }
      validators.push(CompanyUpsertUtils.getUrlValidator.bind(this));
      return validators;
    } else {
      return getValidator(field, {}, false);
    }
  }

  

  onCancelClick() {
    this.cancelClick.emit();
  }

  selectionChanged() {
    if(this.stepper.selectedIndex === size(this.stepLabels) - 2) {
      this.currentNextLabel = this.submitLabel;
    } else {
      this.currentNextLabel = this.nextLabel;
    }
  }

  onNextClick($event: any, index: number) {
    if(!this.formsInfo[index].formGroup.valid) {
      this.formsInfo[index].errors = getFormErrors(this.formsInfo[index].formGroup);
      this.formsInfo[index].formGroup.setErrors(getFormErrors(this.formsInfo[index].formGroup));
    } else {
      if(index !== size(this.stepLabels) - 1) {
        if(index === size(this.stepLabels) - 2) {
          this.currentNextLabel = this.submitLabel;
        }
        return;
      }
      let data: any;
      forEach(this.stepLabels, (label, idx) => {
        data = assign(data, this.formsInfo[idx].formGroup.getRawValue());
      });
      const dateTimeFields = filter(this.allFields, field => (field.dataType === DataTypes.DATETIME || field.dataType === DataTypes.DATE));
      const GSObject = this._env.uiEnvironment;
      const timeZoneKey = GSObject.timeZoneKey;
      forEach(dateTimeFields, field => {
        if(field.dataType === DataTypes.DATETIME) {
          if(data[field.fieldName + '_time'] && data[field.fieldName] && !this.isFieldDisabled(field)) {
            const time = data[field.fieldName + '_time'] ? moment(data[field.fieldName + '_time']).format(' HH:mm') : "";
            let date = moment(data[field.fieldName]).format(DATE_FORMAT);
            date = moment(date + time)
              .tz(timeZoneKey, true)
              .format(DATE_TIME_FORMAT_WITH_TIMEZONE);
            data[field.fieldName] = date;
          }
          delete data[field.fieldName + '_time'];
        } else if(!this.isFieldDisabled(field) && data[field.fieldName]){
          data[field.fieldName] = moment(data[field.fieldName]).format(DATE_FORMAT);
        }
      });
      this.updatedObject.emit({value: data, fields: this.allFields});
    }
  }

  ngOnDestroy() {
    forEach(this.subscriptions, subscription => subscription.unsubscribe());
  }

}
