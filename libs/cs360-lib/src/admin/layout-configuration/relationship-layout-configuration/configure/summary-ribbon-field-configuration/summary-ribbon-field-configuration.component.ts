import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import { includes } from 'lodash';
import { SubSink } from 'subsink';
import { FieldConfigurationComponent, ObjectNames, getFieldWithMapping } from '@gs/cs360-lib/src/common';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {
  Customize_Field_Options,
  getDefaultFormat
} from "@gs/cs360-lib/src/common";
import {EnvironmentService} from "@gs/gdk/services/environment";
// import { CS360Service} from "@gs/cs360-lib";
import {NzNotificationService} from "@gs/ng-horizon/notification";
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';
import { isFieldEditDisabled } from '@gs/cs360-lib/src/portfolio-copy';
// import { ObjectNames } from '../../../../cs360.constants';
// import { getFieldWithMapping } from '../../../../cs360.utils';

@Component({
  selector: 'gs-summary-ribbon-field-configuration',
  templateUrl: './summary-ribbon-field-configuration.component.html',
  styleUrls: ['./summary-ribbon-field-configuration.component.scss']
})
export class SummaryRibbonFieldConfigurationComponent extends FieldConfigurationComponent implements OnInit {
  protected subs = new SubSink();
  constructor(public fb: FormBuilder, public notification: NzNotificationService, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,@Inject("envService") public env: EnvironmentService, i18nService: NzI18nService, translocoService: TranslocoService) {
    super(fb, ctx, notification, env, i18nService, translocoService);
  }

  ngOnInit() {
  }

  protected setFieldConfigForm() {
    this.field.properties = this.field.properties ? this.field.properties : {};
    this.lookupDisplayField = this.field.lookupDisplayField;
    this.field.formatOptions = this.field.formatOptions ? this.field.formatOptions : {};
    this.initSearchableFields();
    this.fieldConfigForm = this.fb.group({
      label: [this.field.label, [Validators.required, extraSpaceValidator, Validators.maxLength(90)]],
      description: this.field.description,
      editable: !!this.field.properties.editable,
      required: this.field.properties.required !== undefined ? this.field.properties.required : this.field.required,
      type: this.field.formatOptions.type ? this.field.formatOptions.type : getDefaultFormat(this.field.dataType),
      numericalSummarization: this.field.formatOptions.numericalSummarization ? this.field.formatOptions.numericalSummarization : 'DEFAULT',
      scale: this.field.scale !== undefined ? this.field.scale : this.field.meta && this.field.meta.decimalPlaces,
      rollup: this.field.properties.rollup,
      aggregateFunction: this.field.aggregateFunction ? this.field.aggregateFunction.toUpperCase() : null,
      navigationConfig: this.field.properties ? this.field.properties.navigationConfig : null,
      lookupDisplayField: this.field.lookupDisplayField && this.field.lookupDisplayField.label,
      searchableFields: [this.searchableFields.map(f => f.label)],
    });
    this.setSearchableFieldsVisibility();
    this.subs.add(this.fieldConfigForm.valueChanges.subscribe(formValue => {
      this.setSearchableFieldsVisibility(formValue.editable);
      this.fieldConfigControlOptions.showRequired = formValue.editable;
      this.fieldConfigControlOptions.showNumericSummarization = includes(Customize_Field_Options.numericalSummarization, formValue.type);
    }));
    this.subscribeToSearchableFields();
  }

  setSearchableFieldsVisibility(editable: boolean = true): void {
    const fieldEditAllowed = !(isFieldEditDisabled(this.field, ObjectNames.RELATIONSHIP) || getFieldWithMapping(this.field, 'GS_COMPANY_ID'));
    this.fieldConfigControlOptions.showSearchConfig = this.fieldConfigOptions.showSearchConfig && this.field.meta.hasLookup && fieldEditAllowed;
  }

}
