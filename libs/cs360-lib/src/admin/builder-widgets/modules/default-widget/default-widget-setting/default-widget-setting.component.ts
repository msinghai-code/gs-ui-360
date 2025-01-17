import { Component, OnInit } from '@angular/core';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SummaryWidget } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-default-widget-setting',
  templateUrl: './default-widget-setting.component.html',
  styleUrls: ['./default-widget-setting.component.scss']
})
export class DefaultWidgetSettingComponent extends BaseWidgetComponent   implements OnInit {
  widgetForm: FormGroup;
  widgetItem: SummaryWidget;
  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.widgetForm = this.fb.group({
      label: [this.widgetItem.label, [Validators.required, extraSpaceValidator]],
      id: [this.widgetItem.itemId]
    });
  }

  toJSON() {
    if (this.widgetForm.valid) {
      return { ...this.widgetItem, ...this.widgetForm.value };
    } else {
      this.widgetForm.markAsTouched();
      return {};
    }
  }

}
