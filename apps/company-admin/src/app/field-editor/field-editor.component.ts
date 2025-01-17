import { Component, OnInit, Input, EventEmitter, Pipe, PipeTransform, Inject, ViewChild, ElementRef, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { getValidator } from '@gs/gdk/services/formly';
import {FilterQueryService} from "@gs/gdk/filter/builder";
import { Observable, of } from 'rxjs';
import { escape, includes, get, uniq } from 'lodash';
import { distinctUntilChanged, debounceTime, switchMap, map, tap, catchError, filter } from 'rxjs/operators';
import { ENTER, UP_ARROW, DOWN_ARROW, PAGE_UP, PAGE_DOWN } from '@angular/cdk/keycodes';
import { CURRENCYISOCODE_FIELD_NAME, DataTypes, NAME_SEARCHABLE_FIELD_NAMES } from '../company-operations/constants';
import { CompanyUpsertUtils } from '../company-operations/CompanyUpsertUtils';
import { FieldEditorService } from './field-editor.service';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import {EnvironmentService, CurrencyService} from "@gs/gdk/services/environment";
import { GSField } from "@gs/gdk/core";
const skipKeys = [ENTER, UP_ARROW, DOWN_ARROW, PAGE_UP, PAGE_DOWN];

@Component({
  selector: 'gs-field-editor',
  templateUrl: './field-editor.component.html',
  styleUrls: ['./field-editor.component.scss']
})
export class FieldEditorComponent implements OnInit {

  constructor(private fqs: FilterQueryService, private fieldEditorService: FieldEditorService,private i18nService: NzI18nService, @Inject("envService") private _env: EnvironmentService,) { }
 //{360.admin.field_editor.hh:mm a}=hh:mm a-->
 date_format = this.i18nService.translate('360.admin.field_editor.hh:mm a')

  @Input() field: any;
  @Input() isInlineEdit: boolean;
  @Input() set currencyIsoCode(code: string) {
    this.selectedCurrencyIsoCode = code;
  }
  @Input() schema: any;
  @Input() parentFormGroup: FormGroup;
  @Input() set errors(errors: any) {
    this._errors = errors;
  }
  @Input() isWhoIdDisabled = true;

  @Output() updateCurrencyIsoCode = new EventEmitter();
  @Output() picklistUpdated = new EventEmitter();

  _errors: any;
  rtaText: any;
  dataType: string;
  searching = {};
  search: EventEmitter<[string, any, number, HTMLElement]> = new EventEmitter();
  resultedItems: Map<string, any[]> = new Map();
  searchResult: Observable<any>;
  timePickerOpenValue = new Date(0,0,0,0,0,0,0);
  selectedCurrencyIsoCode: string;
  dependencyResponse: any;
  picklistOptions = [];
  quillConfig = {
    toolbar : {
      container : [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'font': [] }],
        ['link']
      ]
    }
  };

  ngOnInit() {
    this.searchLookupField();
    if(this.field.fieldName.toLowerCase() === CURRENCYISOCODE_FIELD_NAME) {
      this.parentFormGroup.get(this.field.fieldName).valueChanges.subscribe(value => {
        this.updateCurrencyIsoCode.emit(value);
      });
    } else if(this.field.dataType === DataTypes.DATETIME) {
      let time = this.parentFormGroup.get(this.field.fieldName).value;
      if(!this.parentFormGroup.get(this.field.fieldName).value) {
        time = null;
      } else {
        time = new Date(this.parentFormGroup.get(this.field.fieldName).value);
      }
      this.parentFormGroup.addControl(this.field.fieldName + "_time", new FormControl({value: time, disabled: this.parentFormGroup.get(this.field.fieldName).disabled}, getValidator(this.field, {}, true)));
    } else if(this.field.dataType === DataTypes.RICHTEXTAREA) {
      this.rtaText = this.parentFormGroup.get(this.field.fieldName).value;
    }
    if(CompanyUpsertUtils.isIndirectLookup(this.field)) {
      this.dataType = DataTypes.LOOKUP;
    } else {
      this.dataType = this.field.dataType;
    }
    if(this.field.meta.dependentPicklist && this.field.meta.controllerName && this.field.controllerField) {
      const controllerCategoryId = this.field.controllerField.meta.properties.PICKLIST_CATEGORY_ID;
      const dependentCategoryId = this.field.meta.properties.PICKLIST_CATEGORY_ID;
      this.fieldEditorService.getDependencyItemMappings([{controllerId: controllerCategoryId, dependentId: dependentCategoryId}]).subscribe(res => {
        this.dependencyResponse = res.data;
        this.setPicklistOptions();
      });
    } 
    if(this.dataType === DataTypes.PICKLIST) {
      this.parentFormGroup.get(this.field.fieldName).valueChanges.subscribe(value => {
        this.picklistUpdated.emit(this.field);
      });
    }
    this.picklistOptions = this.field.options;
  }

  onRTAContentChanged(value) {
    const GS = this._env.gsObject;
    if(GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]){
      this.parentFormGroup.get(this.field.fieldName).setValue(value.html);
      } else {
        this.parentFormGroup.get(this.field.fieldName).setValue(escape(value.html));
      }
  }

  /**
   * @returns array of fields -> fields to search on AND fields to select (if includeSelect is true)
   * -=> fields to search on: 
   *     -> if exists => named field configured in lookup detail // TODO
   *     -> (ELSE) if exists => 'Name' field on lookup object
   *     -> (ELSE) field.meta.lookupDetail (for custom lookups) -> last option (when there are no fields to search on) // TODO
   * -=> fields to select (bring data)
   *     -> all 'fields to search' (above)
   *     -> 'Gsid' for sure
   *    -> (ELSE) if exists => field on which lookup is created (field.meta.lookupDetail)
   */
  getSearchableFields(field, includeSelect = false): string[] {
    const fieldsToSelect = [];
    const lookupField = get(field, 'meta.lookupDetail.fieldName');

    if(includeSelect) {
      fieldsToSelect.push('Gsid');

      if (lookupField) {
        fieldsToSelect.push(lookupField);
      }
    }

    // const namedField = get(field, 'meta.lookupDetail.lookupObjects[0].namedFieldDetails.fieldName');
    // if (namedField) {
    //   fieldsToSelect.push(namedField);
    // } else 
    if (includes(NAME_SEARCHABLE_FIELD_NAMES, CompanyUpsertUtils.getLookupObject(field))) {
      fieldsToSelect.push('Name');
    } 
    // else if (lookupField) {
    //   fieldsToSelect.push(lookupField);
    // }
    else {
      fieldsToSelect.push('Gsid');
    }

    return uniq(fieldsToSelect);
  }

  searchLookupField() {
    this.searchResult = this.search.pipe(
      filter(v => skipKeys.indexOf(v[2]) === -1 && v[0].length >= 1),
      distinctUntilChanged((a, b) => a[0] === b[0] && a[3] === b[3]),
      debounceTime(300),
      tap(v => {
        this.searching = {
          ...this.searching,
          [v[1].fieldName]: true
        };
      }),
      switchMap(conf => {
        const [str, field] = conf;
        const term = (str || '').trim();
        if (term.length >= 1) {
          if(field.fieldName === "ManagedBy") {
            return this.fieldEditorService.fetchCompanyAdvanceLookupForManagedBy({"Name": term});
          }
          const { dataStore, source } = this.schema;
          const query = [
            {
              selectFields: this.getSearchableFields(field, true),
              searchFields: this.getSearchableFields(field),
              value: [term],
              operator: 'CONTAINS',
              useDBName: false,
              object: CompanyUpsertUtils.getLookupObject(field),
              source,
              dataStore,
              connectionId: null
            }
          ];
          if (CompanyUpsertUtils.getLookupObject(field) === 'gsuser') {
            try {
              query[0].selectFields.push('IsActiveUser');
              return this.fqs.search(query).pipe(map(v => {
                if (v && v.length) {
                  v = v.filter(x => x.isactiveuser);
                }
                return [field.fieldName, v];
              }));
            } catch (e) {
              query[0].selectFields = ['Name', 'Gsid'];
              return this.fqs.search(query).pipe(map(v => [field.fieldName, v]));
            }
          }
          else
            return this.fqs.search(query).pipe(map(v => [field.fieldName, v]));
        } else {
          return of([field.fieldName, []]);
        }
      }),
      tap(v => {
        console.log(v);
        if(!v) {
          v = [this.field.fieldName, []];
        }
        this.resultedItems.set(v[0], v[1]);
        this.resultedItems = new Map(this.resultedItems);
        this.searching = {
          ...this.searching,
          [v[0]]: false
        };
      }),
      map(v => this.resultedItems),
      catchError(e => {
        return of(this.resultedItems);
      })
    );
  }

  removeFocus(event) {
    if (document.querySelector('.gs-content')) {
      document.querySelector('.gs-content').scrollTop = 0;
    }
  }

  onOptionSelected(value, field) {
    this.parentFormGroup.get(field.fieldName).setValue(value.value);
  }

  getOptions(open:boolean) {
    if(!this.field.controllerField || !open) {
      return;
    }
    this.setPicklistOptions();
  }
   //{360.csm.picklist.none_label}=None
  setPicklistOptions() {
    const selectedControllerValue = this.parentFormGroup.get(this.field.controllerField.fieldName) ? this.parentFormGroup.get(this.field.controllerField.fieldName).value : this.field.controllerValue;
    const filteredOptions = CompanyUpsertUtils.getMappedOptions(this.dependencyResponse, selectedControllerValue, this.field.options);
		this.picklistOptions = filteredOptions.length ? filteredOptions : [{active: false, value: null, label: this.i18nService.translate('360.csm.picklist.none_label')}];
  }

  displayWith(fieldValue) {
    return fieldValue ? fieldValue.name ? fieldValue.name : fieldValue.gsid : '';
  }

  onClearButtonClick(target: any, field: any) {
    this.parentFormGroup.get(field.fieldName).setValue('');
    if(this.parentFormGroup.get(field.fieldName + '_time')) {
      this.parentFormGroup.get(field.fieldName + '_time').setValue(null);
    }
  }

}


@Pipe({
  name: 'labelWithSymbol',
  pure: false
})
export class LabelWithSymbolPipe implements PipeTransform {
  currencyInstanceIsoCode: string;
  constructor(@Inject("envService") private _env: EnvironmentService, private currencyService: CurrencyService) {
    this.currencyInstanceIsoCode = this._env.instanceDetails ? this._env.instanceDetails.currency.isoCode : '';
   }

  transform(value: string, field: GSField, currencyISOCode?: any) {
    switch (field.dataType) {
      case 'PERCENTAGE':
        return `${value}(%)`;
      case 'CURRENCY':
          const currencyVariant = this.currencyService.currencyDetails.gsCurrencyConfig ? this.currencyService.currencyDetails.gsCurrencyConfig.currencyVariant :
          (window['GS'].gsCurrencyConfig ? window['GS'].gsCurrencyConfig.currencyVariant : '');
          let currencySymbol;
          if (currencyVariant === "MULTI_CURRENCY") {
            currencySymbol = currencyISOCode || this.currencyService.currencyDetails.gsCurrencyConfig.currencyIsoCode;
          } else if (currencyVariant === "SINGLE_CURRENCY") {
            currencySymbol = this.currencyService.currencyDetails.gsCurrencyConfig.currencyIsoCode;
          } else {
            if (field && field.meta && field.meta.properties) {
              currencySymbol = field.meta.properties.CURRENCY_UNICODE;
            } else {
              currencySymbol = this.currencyService.currencyDetails.gsCurrencyConfig.currencyIsoSymbol;
            }
          }
        if (currencySymbol)
          return `${value} (${currencySymbol})`;
        else
          return `${value}`;
      default:
        return value;
    }
  }
}


@Pipe({
  name: 'fieldResult'
})
export class SearchResultPipe implements PipeTransform {
  transform(value: any, field) {
    return value && value.get ? value.get(field.fieldName) || [] : [];
  }
}
