import {
  IReportFilter
  } from '@gs/core';
import {ReportUtils } from "@gs/report/utils";
import { WIDGET_RENDER_STATUS} from "@gs/gdk/widget-viewer"
  import { MessageType, HostInfo } from '@gs/gdk/core';
import { BaseWidgetComponent, WIDGET_EVENTS } from "@gs/gdk/widget-viewer";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
  } from '@angular/core';
import { forEach, size, keys, cloneDeep } from 'lodash';
import { IWidgetState } from '@gs/core/src/shared/src/utils/pojos/IWidgetState';
import { PortfolioAdminWidgetFacade } from './state/portfolio-admin-widget.facade';
import { PortfolioAdminWidgetService } from './portfolio-admin-widget.service';
import {
  PortfolioConfig,
  PortfolioFieldTreeMap,
  PortfolioFieldTreeInfo,
  getFieldMeta,
  isFieldEditDisabled,
  PORTFOLIO_WIDGET_CONSTANTS,
  COMPANY_SOURCE_DETAILS,
  RELATIONSHIP_SOURCE_DETAILS,
  PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS,
  PortfolioAdminWidgetSettingsAction,
  PortfolioScopes,
  PORTFOLIO_WIDGET_MESSAGE_CONSTANTS,
  isRelationshipEnabled,
  } from '@gs/portfolio-lib';
import { PortfolioLiveAdminGridComponent } from './portfolio-live-admin-grid/portfolio-live-admin-grid.component';
import { SubSink } from 'subsink';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-portfolio-admin-widget',
  templateUrl: './portfolio-admin-widget.component.html',
  styleUrls: ['./portfolio-admin-widget.component.scss']
})
export class PortfolioAdminWidgetComponent extends BaseWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild("liveGrid", { static: false }) liveGridComponent: PortfolioLiveAdminGridComponent;

  openPortfolioSetting = false;
  modifiedFields: PortfolioFieldTreeMap = {
    relationship: PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO,
    company: PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO
  };
  globalFilter = null;
  allFilters = null;
  isFullScreen = false;
  savedConfig: PortfolioConfig;
  superSavedConfig: any = {};
  loading = true;
  loaderOptions = PORTFOLIO_WIDGET_CONSTANTS.LOADER_OPTIONS;
  isPreviewMode = false;
  isDashboard = false;
  configuredObjectNames = [];
  showRelationshipTab: boolean;
  showCompanyTab: boolean;
  selectedTab = 'company';

  protected widgetState: IWidgetState;
  private portfolioId: string;
  private subs = new SubSink();
  private widgetLoadedFired = false;
  private configSet = false;

  constructor(
     private portfolioAdminWidgetFacade: PortfolioAdminWidgetFacade,
     public cdr: ChangeDetectorRef,
     @Inject("envService") public env: EnvironmentService,
     public hostElement: ElementRef,
     private portfolioAdminService: PortfolioAdminWidgetService,
     private i18nService: NzI18nService) {
    super();
  }

  ngOnInit() {
    this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_INITIALIZED);
  }

  // @ts-ignore
    ngOnChanges(changes: SimpleChanges) {
      if(changes.properties) {
          if(this.properties && !this.configSet) {
              this.isDashboard = this.properties.context.requestSource.includes("DASHBOARD");
              this.getConfig();
              this.portfolioAdminService.setRequestSource(this.properties.context.requestSource);
              this.configSet = true;
          }
          if(this.properties &&
              (this.properties.context.requestSource === PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.GS_HOME_PREVIEW ||
                  this.properties.context.requestSource === PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.DASHBOARD_PREVIEW) &&
              this.properties.context.type !== "DEFAULT") {
              this.setPreviewModeProperties();
          }
      }
  }

  private setPreviewModeProperties() {
    this.isPreviewMode = true;
    if(this.properties && this.properties.filters) {
      this.setGlobalFilter(this.properties.filters);
    }
  }

  private getConfig() {
    this.portfolioId = this.properties.portfolioId;
    if(this.portfolioId) {
      // Admin in Customized GS Home or Recommended Home
      this.subscribeForSavedConfig();
    } else {
      // Creating Customized Home
      this.subscribeForNewConfig();
    }
    this.fetchObjectDetails();
  }

  private subscribeForSavedConfig() {
    this.subs.add(this.portfolioAdminService.getPortfolioConfig(this.portfolioId).subscribe((response: PortfolioConfig) => {
      this.setConfig(response);
    }));
  }

  private subscribeForNewConfig() {
    const source = this.isDashboard ? PortfolioScopes.DASHBOARD : PortfolioScopes.GSHOME;
    this.subs.add(this.portfolioAdminService.createAdminPortfolioConfig(source).subscribe((response: PortfolioConfig) => {
      this.setConfig(response);
    }));
  }

  private setConfig(response: PortfolioConfig) {
    this.savedConfig = {...response};
    // this is to keep the original configuration since savedConfig is mutated
    this.superSavedConfig = cloneDeep(response);
    if(!this.savedConfig.configuration) {
      this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_DATA_LOADED, WIDGET_RENDER_STATUS.FAILURE);
    } else {
      this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_DATA_LOADED);
    }
    this.portfolioId = response.portfolioId;
    this.setConfiguredObjectNames();
    this.loading = false;
    this.cdr.detectChanges();
    this.setSubscriptions();
    this.onWidgetLoaded();
  }

  private setSubscriptions() {
    this.subscribeForCompanyFields();
    if(isRelationshipEnabled(this.env.gsObject)) {
      this.subscribeForRelationshipFields();
    }
  }

  private subscribeForCompanyFields() {
    this.subs.add(this.portfolioAdminWidgetFacade.getCompanyFields$.subscribe(companyFieldTree => {
      if (companyFieldTree.fields.length) {
        this.setModifiedFields(companyFieldTree, PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME);
      }
    }));
  }

  private subscribeForRelationshipFields() {
    this.subs.add(this.portfolioAdminWidgetFacade.getRelationshipFields$.subscribe(relationshipFieldTree => {
      if(relationshipFieldTree.fields.length) {
        this.setModifiedFields(relationshipFieldTree, PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME);
      }
    }));
  }

  private setModifiedFields(fieldTree: PortfolioFieldTreeInfo, objectName: string) {
    const selectedFields = [];
    const ssc = {...this.superSavedConfig};
    if(ssc && ssc.configuration[objectName].showFields) {
      forEach(ssc.configuration[objectName].showFields, configuredField => {
        const selectedField = getFieldMeta(configuredField, fieldTree, objectName);
        if(selectedField) {
          selectedField.displayName = configuredField.displayName;
          selectedField.selected = true;
          selectedField.editDisabled = configuredField.editDisabled === undefined ? isFieldEditDisabled(selectedField, objectName) : configuredField.editDisabled;
          selectedField.editable = configuredField.editable;
          selectedField.deletable = configuredField.deletable;
          selectedField.displayOrder = configuredField.displayOrder;
          selectedField.hidden = configuredField.hidden;
          selectedFields.push(selectedField);
        }
      })
    }
    this.modifiedFields[objectName] = {fields: fieldTree.fields, children: fieldTree.children, selectedFields};
    this.modifiedFields = {...this.modifiedFields};
  }

  onGridResized() {
    if(this.liveGridComponent) {
      this.liveGridComponent.resizeGrid();
    }
  }

  onWidgetLoaded() {
    if(!this.widgetLoadedFired) {
      this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_RENDERED, WIDGET_RENDER_STATUS.SUCCESS);
      this.widgetLoadedFired = true;
    }
  }

  getPropertiesToPersist() {
    return {
      ...this.properties,
      portfolioId: this.portfolioId
    }
  }

  getSourceDetails()
  {
      const companySourceDetails = {...COMPANY_SOURCE_DETAILS, objectLabel: this.i18nService.translate('360.admin.light_admin_grid.companyTab')}
      const relationshipSourceDetails = {...RELATIONSHIP_SOURCE_DETAILS, objectLabel: this.i18nService.translate('360.admin.light_admin_grid.relationshipTab')}
      if(isRelationshipEnabled(this.env.gsObject) && this.showRelationshipTab && this.showCompanyTab) {
        return [companySourceDetails,relationshipSourceDetails];
      }
      else if(this.showCompanyTab){
        return [companySourceDetails];
      }
      else if(isRelationshipEnabled(this.env.gsObject) && this.showRelationshipTab){
        return [relationshipSourceDetails]
      }
      else {
        return [];
      }

  }

  isFilterable(): boolean {
    return true;
  }

  getTitle(): string {
    return this.savedConfig && this.savedConfig.portfolioName? this.savedConfig.portfolioName: this.i18nService.translate('360.admin.portfolio_admin_widget.portfolioName');
  }

  clearUserState(source, id) {
    this.subs.add(this.portfolioAdminService.clearUserState(source, id).subscribe());
  }

  onFilterUpdate(globalFilter?: IReportFilter): void {
    if(this.properties.context.requestSource === PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.DASHBOARD_PREVIEW ||
      this.properties.context.requestSource === PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.GS_HOME_PREVIEW) {
        this.loading = true;
        this.setGlobalFilter(globalFilter);
    }
  }

  private setGlobalFilter(filter: any) {
    if(this.properties.context.requestSource.includes("DASHBOARD") ) {
      const portfolioFilters = [];
      forEach(filter, f => {
        portfolioFilters.push(f.widgets.filter(widget => widget.widgetId === this.id));
      })
      this.globalFilter = portfolioFilters;
    } else {
      this.globalFilter = filter && size(filter.conditions) ? filter : {conditions: [], expression: ""};
    }
  }

  fetchObjectDetails() {
    const host: HostInfo = ReportUtils.getFieldTreeHostInfo(COMPANY_SOURCE_DETAILS);
    const relationshipHost: HostInfo = ReportUtils.getFieldTreeHostInfo(RELATIONSHIP_SOURCE_DETAILS);
    this.portfolioAdminWidgetFacade.describeObject(host);
    this.portfolioAdminWidgetFacade.describeObject(relationshipHost);
  }

  onGridInitialized() {
    this.loading = false;
    this.cdr.detectChanges();
  }

  openSettings($event) {
    this.openPortfolioSetting = !this.openPortfolioSetting;
  }

  private setConfiguredObjectNames() {
    this.configuredObjectNames = [];
    forEach(keys(this.savedConfig.configuration), key => {
      if(this.savedConfig.configuration[key].showTab) {
        this.configuredObjectNames.push(key);
      }
    });
    this.getTabStatus(this.savedConfig)
  }

  getTabStatus(config){
      this.showRelationshipTab = config && config.configuration && config.configuration.relationship && config.configuration.relationship.showTab;
      this.showCompanyTab = config && config.configuration && config.configuration.company && config.configuration.company.showTab;
  }

  onAction(actionInfo: PortfolioAdminWidgetSettingsAction) {
    switch(actionInfo.type) {
      case PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.SAVE:
        this.loading = true;
        this.getTabStatus(actionInfo && actionInfo.data);
        this.subs.add(this.portfolioAdminService.updatePortfolioConfig(this.portfolioId, actionInfo.data).subscribe(response => {
          if(response) {
            this.savedConfig = response;
            this.superSavedConfig = cloneDeep(response);
            this.setConfiguredObjectNames();
            this.cdr.detectChanges();
            this.setModifiedFields(this.modifiedFields[PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME], PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME);
            if(isRelationshipEnabled(this.env.gsObject)) {
              this.setModifiedFields(this.modifiedFields[PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME], PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME);
            }
            this.changes.emit({
              type : 'WIDGET_CONFIG_SAVED' , payload : true
            });
            this.loading = false;
          }
        }));
        this.openPortfolioSetting = !this.openPortfolioSetting;
        break;
      case PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.CLOSE:
        this.openPortfolioSetting = !this.openPortfolioSetting;
        break;
      case PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.ERROR:
        this.portfolioAdminWidgetFacade.showToastMessage(actionInfo.data, MessageType.ERROR);
        break;
      case PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS.GRID_DISABLE:
        this.dispatchWidgetEvents("WIDGET_DISABLED", {id: this.id, type: this.type, properties: this.properties, objectName: actionInfo.data});
        break;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
