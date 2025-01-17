import { Component, Inject } from "@angular/core";
// import { BaseWidgetComponent, DescribeService, extraSpaceValidator, IField } from "@gs/core";
import {BaseWidgetComponent} from "@gs/gdk/widget-viewer";
import { DescribeService } from "@gs/gdk/services/describe";
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { GSField } from "@gs/gdk/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SummaryWidget, Cs360ContextUtils, ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { DataTypes } from "@gs/cs360-lib/src/portfolio-copy";

@Component({
  selector: 'gs-original-contract-date-settings',
  templateUrl: './original-contract-date-settings.component.html',
  styleUrls: ['./original-contract-date-settings.component.scss']
})
export class OriginalContractDateSettingsComponent extends BaseWidgetComponent {

  widgetForm: FormGroup;
  widgetItem: SummaryWidget;
  options: GSField[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    private ds: DescribeService
    ) {
    super();
  }

  ngOnInit(): void {
    this.setFormGroup();    
    this.setDateFieldOptions();
  }

  setFormGroup() {
    this.widgetForm = this.fb.group({
      label: [this.widgetItem.label, [Validators.required, extraSpaceValidator, Validators.maxLength(90)]],
      id: [this.widgetItem.itemId],
      config: [this.widgetItem && this.widgetItem.config && this.widgetItem.config.fieldName, Validators.required]
    });
  }

  setDateFieldOptions() {
    const host = { id: "mda", name: "mda", type: "mda" };
    this.loading = true;
    this.ds.getObjectTree(host, Cs360ContextUtils.getBaseObjectName(this.ctx), 0, null, { includeChildren: false, skipFilter: true })
      .then(fields => {
        this.options = (fields.obj.fields || []).filter(fld => [DataTypes.DATE.toString(), DataTypes.DATETIME].includes(fld.dataType));
        this.loading = false;
      });
  }

  toJSON() {
    if(this.widgetForm.valid) {
      const { label, id, config} =  this.widgetForm.value;
      const field = this.options.find(fld => fld.fieldName === config);
      return {
        label, id,
        config: {
          fieldName: config,
          dataType: field.dataType,
          formatOptions: {
            skipFormatting: true,
            customFormatterType: "SUMMARY_DATA_TYPE"
          }
        }
      }
    }
    return {
      isValid: false,
      message: ''
    }
  }
}
