import { Component, OnInit } from '@angular/core';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SummaryWidget } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-healthscore-widget-settings',
  templateUrl: './healthscore-widget-settings.component.html',
  styleUrls: ['./healthscore-widget-settings.component.scss']
})
export class HealthscoreWidgetSettingsComponent extends BaseWidgetComponent   implements OnInit {
  widgetForm: FormGroup;
  widgetItem: SummaryWidget;
  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    const { label ,itemId , config={} } = this.widgetItem;
    this.widgetForm = this.fb.group({
      label: [label, [Validators.required, extraSpaceValidator]],
      id: [itemId],
      isViewMeasure: [config.isViewMeasure || false]
    });
  }

  toJSON(): any {
    if (this.widgetForm.valid) {
      const { label ,id, isViewMeasure } = this.widgetForm.value;
      return { ...this.widgetItem, label, id ,isValid: true, config:{ isViewMeasure} };
    } else {
      this.widgetForm.markAsTouched();
      return { isValid: false};
    }
  }

}
