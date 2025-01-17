import { cloneDeep, forEach } from 'lodash';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
  } from '@angular/core';
import {
  PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS,
  PORTFOLIO_WIDGET_MESSAGE_CONSTANTS,
  PortfolioAdminWidgetSettingsAction,
  PortfolioConfig,
  PortfolioFieldTreeMap,
  PortfolioWidgetGSField,
  DataTypes,
  isRelationshipEnabled, PortfolioGSField
} from '@gs/portfolio-lib';
import * as DOMPurify from 'dompurify';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";


@Component({
  selector: 'gs-portfolio-admin-widget-setting',
  templateUrl: './portfolio-admin-widget-setting.component.html',
  styleUrls: ['./portfolio-admin-widget-setting.component.scss']
})
export class PortfolioAdminWidgetSettingComponent implements OnInit {
  @Input() fieldTreeMap: PortfolioFieldTreeMap;
  @Input() config: PortfolioConfig;
  @Input() isDashboard: boolean;

  @Output() onAction: EventEmitter<PortfolioAdminWidgetSettingsAction> = new EventEmitter();

  TITLE_ACTIONS = {
    SHOW: "show",
    CLEAR: "clear",
    DONE: "done"
  };
  invalid = false;
  showTitleInput = false;
  updatedConfig: PortfolioConfig;
  updatedFieldTree: PortfolioFieldTreeMap;
  isRelationshipEnabled = true;
  showGlobalFilterWarning = [];

  constructor(@Inject("envService") public env: EnvironmentService, public i18nService: NzI18nService) {
    this.isRelationshipEnabled = isRelationshipEnabled(this.env.gsObject);
  }
    // 360.admin.admin_widget.globalFiltersText1 =By deleting
    // 360.admin.admin_widget.globalFiltersText2 =grid, it will effect global filters if created.
    showGlobalFilterWarningText = this.i18nService.translate('360.admin.admin_widget.globalFiltersText1')+' ' + this.showGlobalFilterWarning.join(', ')+ ' '+this.i18nService.translate('360.admin.admin_widget.globalFiltersText2');

  ngOnInit() {
    this.setConfigs();
  }

  onGridDisable() {
    if(this.isDashboard) {
      this.showGlobalFilterWarning = [];
      const isCompanyDisabled = (this.config.configuration.company.showTab && !this.updatedConfig.configuration.company.showTab);
      const isRelationshipDisabled = (this.config.configuration.relationship.showTab && !this.updatedConfig.configuration.relationship.showTab);
      if(isCompanyDisabled) {
        this.showGlobalFilterWarning.push("company");
      }
      if(isRelationshipDisabled) {
        this.showGlobalFilterWarning.push("relationship");
      }
    }
  }

  close() {
    this.setConfigs();
    this.onAction.emit({ type: PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.CLOSE, data: null });
  }

  private setConfigs() {
    this.updatedConfig = cloneDeep(this.config);
    this.updatedFieldTree = cloneDeep(this.fieldTreeMap);
  }

  setInvalid(invalid: boolean) {
    this.invalid = invalid;
  }

  saveSettings() {

    if(!this.updatedConfig.configuration.relationship.showTab && !this.updatedConfig.configuration.company.showTab) {
      this.onAction.emit({
        type: PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.ERROR,
        data: this.i18nService.translate(PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.TAB_SELECTION_ERROR)
      });
      return;
    }

    if(this.invalid) {
      this.onAction.emit({
        type: PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.ERROR,
        data: PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.INVALID_CONFIG
      });
      return;
    }

    this.updatedConfig.configuration.company.showFields = this.convertFieldsToPortfolioFields(this.updatedFieldTree.company.selectedFields);

    if(this.isRelationshipEnabled) {
      this.updatedConfig.configuration.relationship.showFields = this.convertFieldsToPortfolioFields(this.updatedFieldTree.relationship.selectedFields);
    }
    if(this.isDashboard && this.showGlobalFilterWarning.length) {
      this.onAction.emit({ type: PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.GRID_DISABLE, data: this.showGlobalFilterWarning[0] });
    }
    this.onAction.emit({
      type: PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.SAVE,
      data: this.updatedConfig
    });
  }

  private convertFieldsToPortfolioFields(fields) {
    const modifiedFields = [];
    forEach(fields, (field, idx) => {
      if(field.fieldAlias) {
        modifiedFields.push(field);
        return;
      }
      const displayOrder = field.displayOrder === undefined ? idx + 1 : field.displayOrder;
      const dependentPicklistInfo = this.getDependentPicklistInfo(field, fields);
      const portfolioWidgetGSField = new PortfolioWidgetGSField();
      portfolioWidgetGSField.setPortfolioWidgetGSField(field);
      portfolioWidgetGSField.setSelected(field.selected);
      portfolioWidgetGSField.setDependentPicklistInfo(dependentPicklistInfo);
      portfolioWidgetGSField.setDisplayOrder(displayOrder);
      portfolioWidgetGSField.setDisplayName(DOMPurify.sanitize(field.displayName));
      portfolioWidgetGSField.setDeletable(field.deletable);
      portfolioWidgetGSField.setFieldType(portfolioWidgetGSField.getFieldType() || "field"); // This is the default fieldType for all fields.
      portfolioWidgetGSField.setProperties({ aggregatable: field.meta.aggregatable });
      portfolioWidgetGSField.setEditable(field.editable);
      portfolioWidgetGSField.setEditDisabled(field.editDisabled);
      const gsField: PortfolioGSField = portfolioWidgetGSField.toJSON();
      modifiedFields.push(gsField);
    });
    return modifiedFields;
  }

  private getDependentPicklistInfo(field: any, allFields: any[]) {
    if(field.dataType !== DataTypes.PICKLIST || !field.meta.dependentPicklist) {
      return null;
    }
    const controllerField = allFields.find(f => f.fieldName === field.meta.controllerName);
    return controllerField ? {
      controllerId: controllerField.meta.properties.PICKLIST_CATEGORY_ID,
      dependentId: field.meta.properties.PICKLIST_CATEGORY_ID
    } : {};
  }

  handleTitleActions(evt) {
    switch(evt) {
      case this.TITLE_ACTIONS.SHOW: this.showTitleInput = true; break;
      case this.TITLE_ACTIONS.CLEAR: this.updatedConfig.portfolioName = ""; break;
      case this.TITLE_ACTIONS.DONE:
        if(this.updatedConfig.portfolioName) {
          this.showTitleInput = false;
        }
      break;
    }
  }
}
