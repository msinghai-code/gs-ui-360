import { Inject, Pipe, PipeTransform } from '@angular/core';
import { SummaryWidget, WidgetCategoryType, WidgetCategorytooltipType } from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Pipe({
    name: 'widgetSourceLabel',
    pure: false
  })
  export class WidgetSourceLabelPipe implements PipeTransform {
    standard : string;
    report : string;
    field : string;
    widget : string;
    widget1: string;
      //{360.admin.summary_config.widget}=Widget -
      //{360.admin.summary_config.widget1}=Widget
    constructor(@Inject(NzI18nService) private i18nService ){
      this.standard = this.i18nService.translate(WidgetCategorytooltipType.STANDARD);
      this.report = this.i18nService.translate(WidgetCategorytooltipType.REPORT);
      this.field = this.i18nService.translate(WidgetCategorytooltipType.FIELD);
      this.widget = this.i18nService.translate('360.admin.summary_config.widget');
      this.widget1= this.i18nService.translate('360.admin.summary_config.widget1');
    }
    transform(widgetItem: SummaryWidget) {
      switch(widgetItem.widgetCategory) {
        case WidgetCategoryType.STANDARD: {
          return  this.standard +  this.widget + ` ${(widgetItem.displayName) || widgetItem.subType}`;
        }
        case WidgetCategoryType.FIELD: {
            return this.getFieldLabel(widgetItem);
        }
        case WidgetCategoryType.REPORT: {
          return this.report +  this.widget + ` ${widgetItem.config && widgetItem.config.collectionDetail && widgetItem.config.collectionDetail.objectLabel} - ${(widgetItem.reportName || widgetItem.config && widgetItem.config.reportName)}`;
        }
      }
    }
      
    getFieldLabel(widgetItem) {
      let label = '';
      let widgetFieldPath = widgetItem.fieldPath || widgetItem.config.fieldPath;
        if (widgetFieldPath) {
            let fieldPath = widgetFieldPath;
            while (fieldPath) {
                label += ' - '+ fieldPath.right.label;
                fieldPath = fieldPath.fieldPath;
            }
            label += ' - '+widgetItem.hoverLabel;
            return  this.field +  this.widget1 + `${
                label
            }`;
        } else {
            return  this.field +  this.widget + `${
                widgetItem.hoverLabel
            }`;

        }
    }
}