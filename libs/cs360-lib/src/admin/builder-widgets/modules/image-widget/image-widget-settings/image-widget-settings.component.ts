import { Component, Inject, OnInit } from '@angular/core';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import { DescribeService } from "@gs/gdk/services/describe";
import { SummaryWidget } from '@gs/cs360-lib/src/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { find } from 'lodash';
import { APPLICATION_MESSAGES } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { NzI18nService } from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-image-widget-settings',
  templateUrl: './image-widget-settings.component.html',
  styleUrls: ['./image-widget-settings.component.scss']
})
export class ImageWidgetSettingsComponent extends BaseWidgetComponent implements OnInit {

  public options = [];
  private objectName = "company";

  widgetForm: FormGroup;
  widgetItem: SummaryWidget;
  loading: boolean = true;
  constructor(private fb: FormBuilder, private ds: DescribeService, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO, public i18nService: NzI18nService,) {
    super();
    this.objectName = this.ctx.baseObject;
  }

  ngOnInit() {
    const editable = this.widgetItem.config && this.widgetItem.config.properties ? this.widgetItem.config.properties.editable : false;
    this.widgetForm = this.fb.group({
      label: [this.widgetItem.label, [Validators.required, extraSpaceValidator]],
      id: [this.widgetItem.itemId],
      config: ['', [Validators.required]],
      editable: [editable]
    });

    const host = { id: "mda", name: "mda", type: "mda" };
    this.ds.getObjectTree(host, this.objectName, 0, null, { includeChildren: false, skipFilter: true, filterFunction: this.fieldFilterFunction })
      .then(fields => {
        this.options = this.fieldFilterFunction(fields.obj.fields);
        const seletedItem = find(this.options, (field) => field.fieldName === (this.widgetItem && this.widgetItem.config && this.widgetItem.config.fieldName));
        this.widgetForm.patchValue({ config: seletedItem });
        this.loading = false;
      });
  }

  compareWith(source: any, target: any): boolean {
    if (source && target)
      return source.fieldName === target.fieldName;
    else
      return false;
  }

  isValid() {
    return this.widgetForm.valid;
  }

  toJSON(): any {
    if (this.isValid()) {
      const { label, config, id, editable } = this.widgetForm.value;
      return { ...this.widgetItem, label, id, config: { fieldName: config.fieldName, objectName: config.objectName, dataType: config.dataType, properties: { editable } } };
    } else {
      this.widgetForm.markAsTouched();
      return { isValid: false, message : this.i18nService.translate(APPLICATION_MESSAGES.IMAGE_FIELD_SELECT) };
    }
  }

  fieldFilterFunction(fields) {
    return fields.filter(item => {
      return item.dataType && item.dataType.toUpperCase() === "IMAGE";
    });
  }

}
