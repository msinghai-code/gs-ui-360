import {Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import { getValidator, getFormErrors } from '@gs/gdk/services/formly';
import {FilterQueryService} from "@gs/gdk/filter/builder";
import { DateUtils } from "@gs/gdk/utils/date";
import { GSField } from "@gs/gdk/core";
import { StateAction } from '@gs/gdk/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, filter, map, takeUntil} from "rxjs/operators";
import {debounce} from 'lodash';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import {FormConstants} from "@gs/cs360-lib/src/core-references";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'gs-object-data-edit-form',
  templateUrl: './object-data-edit-form.component.html',
  styleUrls: ['./object-data-edit-form.component.scss']
})
export class ObjectDataEditFormComponent implements OnInit {

  @Input() fields: any[]; // Need to check if it can be IField contract.

  @Input() data: any;

  @Input() editable: boolean;

  @Output() action = new EventEmitter<StateAction>();

  public formGroup: FormGroup;
  public errors: any;
  public searchControl = {
    value: "",
    displayTips: true,
    options: [],
    onSearch: debounce(this.onSearch.bind(this), 400),
    onFocus: (event) => {
      this.searchControl = {
        ...this.searchControl,
        options: []
      }
    }
  }

  constructor(private fb: FormBuilder,
              private _fqs: FilterQueryService,
              @Inject("envService") private env: EnvironmentService,
              private translocoService: TranslocoService) { }

  ngOnInit() {
    this.createObjectEditForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.fields.firstChange) return;
    if(changes.data && changes.data.currentValue) {
      this.updateControlValue(this.fields, changes.data.currentValue);
    }
  }

  private createObjectEditForm(): void {
    if(this.fields && this.fields.length > 0) {
      let formGroup: any = {};
      this.fields.forEach((f: GSField) => {
        const val = this.getControlValue(f, this.data);
        formGroup[f.fieldName] = [val, this.setValidator(f)]
      });
      this.formGroup = this.fb.group(formGroup);
      if(!this.editable) {
        this.formGroup.disable({emitEvent: false});
      }
      this.formGroup.statusChanges
          .pipe(
              debounceTime(300),
              filter(v => !this.formGroup.pristine),
              map(v => ({
                type: FormConstants.EVENTS.FORM_UPDATED,
                payload: null // this.value
              }))
          )
          .subscribe(v => {
            this.errors = getFormErrors(this.formGroup);
          });
    }
  }

  private setValidator(field: GSField) {
    switch (field.dataType.toUpperCase()){
      case 'LOOKUP':
        return null;
      default: return {...getValidator(field, {}), disabled: true};
    }
  }

  async onSearch(value: string, field: GSField): Promise<any> {
    if (value && value.length > 1) {
      // Get the search options from backend.
      const options = await this.getSearchOptions(value, field);
      this.searchControl = {
        ...this.searchControl,
        options,
      }
    } else {
      this.searchControl = {
        ...this.searchControl,
        options: [],
      }
    }
  }

  async getSearchOptions(term: string, field: GSField ) {
    const { meta } = field;
    const { dataStoreType, connectionId, connectionType } = Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService);
    const query = [
      {
        selectFields: ['Name', 'Gsid'],
        searchFields: ['Name'],
        value: [term],
        operator: 'CONTAINS',
        useDBName: false,
        object: meta.lookupDetail.lookupObjects[0].objectName,
        source: connectionType,
        dataStore: dataStoreType,
        connectionId
      }
    ];
    const data = await this._fqs.search(query).toPromise();
    return data;
  }

  private updateControlValue(fields: any[], data: any) {
    this.formGroup.reset();
    fields.forEach((field: GSField) => {
      const { fieldName, meta, dataType, options = [] } = field;
      const { hasLookup } = meta;
      const value = this.getControlValue(field, data);
      this.formGroup.get(fieldName).setValue(value);
    });
  }

  private updateControlOptions() {

  }

  private getControlValue(field: GSField, data: any) {
    const config = this.env.uiEnvironment;
    const { fieldName, meta, dataType, options = [] } = field;
    const { hasLookup } = meta;
    switch (fieldName.toUpperCase()) {
      case 'NUMBER':
      case 'CURRENCY':
      case 'PERCENTAGE':
      case 'PERCENT':
        return data[fieldName];
      case 'PICKLIST':
        return data[fieldName];
      case 'DATE':
        return DateUtils.utc2Local(
            data[fieldName],
            'YYYY-MM-DD HH:mm:ss',
            config.timeZoneKey
        );
      default:
        return data[fieldName];
    }
  }

  public serialize() {
    return this.formGroup.getRawValue();
  }

}
