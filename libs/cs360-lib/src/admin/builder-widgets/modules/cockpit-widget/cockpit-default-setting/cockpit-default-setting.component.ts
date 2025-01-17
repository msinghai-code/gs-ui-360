import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import { SummaryWidget } from '@gs/cs360-lib/src/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { each, filter, find } from 'lodash';
import { APPLICATION_MESSAGES } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-cockpit-default-setting',
  templateUrl: './cockpit-default-setting.component.html',
  styleUrls: ['./cockpit-default-setting.component.scss']
})
export class CockpitDefaultSettingComponent extends BaseWidgetComponent implements OnInit {
  widgetForm: FormGroup;
  widgetItem: SummaryWidget;
  loading: boolean = true;


  displayCount: number = 2;
  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.properties = this.mergeProperties(this.widgetItem.properties.options, this.widgetItem.config);
    this.displayCount = this.widgetItem.properties.displayCount;
    this.widgetForm = this.fb.group({
      label: [this.widgetItem.label, [Validators.required]],
      id: [this.widgetItem.itemId]
    });
  }

  mergeProperties(defaultProperties, configuredProperties) {
    if (configuredProperties && configuredProperties.length) {
      each(defaultProperties, (item) => {
        const searchedValue = find(configuredProperties, (value) => value.id === item.id);
        if (searchedValue) {
          item.selected = true;
        } else {
          item.selected = false;
        }
      });
      return defaultProperties;
    } else {
      return defaultProperties || [];
    }
  }


  isValid() {
    const config = filter(this.properties, value => value.selected);
    if(config.length<2){
      return false;
    }
    return this.widgetForm.valid;
  }

  toJSON(): SummaryWidget | any {
    if (this.isValid()) {
      const config = filter(this.properties, value => value.selected);
      const { label, id } = this.widgetForm.value;
      return { ...this.widgetItem, label, id, config };
    } else {
      this.widgetForm.markAsTouched();
      return { isValid: false, message: APPLICATION_MESSAGES.SUMMARY_SELECT_OPTIONS(this.displayCount) };
    }
  }
  
}


@Pipe({ name: "disableOptions" , pure: false})
export class DisableOptionPipe implements PipeTransform {
  transform(item: any, values: any, displayCount: number, returnTooltip?:boolean): any {
    const selectedValues = filter(values, value => value.selected);
    if (item.selected) {
      return returnTooltip ?  "" : false;
    }
    if (selectedValues.length >= displayCount) {
            return returnTooltip ?  "Max Limited Exceed" : true;
    } else {
      return returnTooltip ?  "" : false;

    }
  }
}