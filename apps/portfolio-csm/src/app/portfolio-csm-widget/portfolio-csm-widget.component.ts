import { BaseWidgetComponent, WIDGET_EVENTS } from "@gs/gdk/widget-viewer";
import {
  COMPANY_SOURCE_DETAILS,
  PortfolioScopes,
  PORTFOLIO_WIDGET_CONSTANTS,
  RELATIONSHIP_SOURCE_DETAILS,
  FilterInfo
} from '@gs/portfolio-lib';
import {
  ChangeDetectorRef,
  Component, Inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { PortfolioConfig, PortfolioFieldTreeMap } from '@gs/portfolio-lib';
import { PortfolioCsmWidgetFacade } from './state/portfolio-csm-widget.facade';
import { PortfolioCsmWidgetService } from './portfolio-csm-widget.service';
import { PortfolioWidgetService } from '@gs/portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service';
import { SubSink } from 'subsink';
import size from "lodash/size";
import forEach from "lodash/forEach";
import keys from "lodash/keys";
import { PortfolioInlineEditComponent } from './portfolio-inline-edit/portfolio-inline-edit.component';
import { HostInfo } from '@gs/gdk/core';
import { WIDGET_RENDER_STATUS} from "@gs/gdk/widget-viewer"
import { NzI18nService } from '@gs/ng-horizon/i18n';
import {TranslocoService} from '@ngneat/transloco';
import { take } from 'rxjs/operators';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzDrawerService} from "@gs/ng-horizon/drawer";
import {PortfolioBulkEditComponent} from "./portfolio-bulk-edit/portfolio-bulk-edit.component";

@Component({
  selector: 'gs-portfolio-csm-widget',
  templateUrl: './portfolio-csm-widget.component.html',
  styleUrls: ['./portfolio-csm-widget.component.scss']
})
export class PortfolioCsmWidgetComponent extends BaseWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild("inlineGrid", { static: false }) inlineGridComponent: PortfolioInlineEditComponent;

  describeFieldTreeMap: PortfolioFieldTreeMap = {
    relationship: PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO,
    company: PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO
  };
  portfolioId = "";
  widgetConfig: PortfolioConfig;
  globalFilter: FilterInfo | FilterInfo[];
  widgetLoadedFired = false;
  isUserConfig = false;
  configuredObjectNames = [];
  showInlineEdit = true;

  private configSet = false;
  private subs = new SubSink();
  errorMsg;

  constructor(private portfolioCsmWidgetFacade: PortfolioCsmWidgetFacade,
    private portfolioCsmWidgetService: PortfolioCsmWidgetService,
    private portfolioWidgetService: PortfolioWidgetService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private i18nService: NzI18nService,
    private drawerService: NzDrawerService,
    @Inject("envService") public env: EnvironmentService
  ) {
      super();
      this.translocoService.selectTranslateObject('360').pipe(take(1)).subscribe(res => {
        this.errorMsg = this.i18nService.translate('360.csm.inline_edit.errorMsg');
      });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_INITIALIZED);
    if(this.properties && !this.configSet) {
      this.setConfig();
      this.configSet = true;
      this.setGlobalFilter(this.properties.filters);
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

  private setWidgetConfig(config: PortfolioConfig) {
    this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_DATA_LOADED);
    this.widgetConfig = config;
    this.configuredObjectNames = [];
    forEach(keys(config.configuration), key => {
        if(config.configuration[key].showTab) {
            this.configuredObjectNames.push(key);
        }
    });
    this.cdr.detectChanges();
  }

  onPortfolioIdUpdate(updatedConfig: any) {
    this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_CHANGES);
    this.setWidgetConfig(updatedConfig);
    this.portfolioId = updatedConfig.portfolioId;
    this.isUserConfig = true;
  }

  onGridResized() {
    if(this.inlineGridComponent) {
      this.inlineGridComponent.resizeGrid();
    }
  }

  setConfig() {
    this.setUpdatedConfig();
    this.fetchObjectDetails();
    this.subscribeForCompanyFields();
    this.subscribeForRelationshipFields();
  }

  setUpdatedConfig() {
    this.portfolioId = this.properties.portfolioId;
    this.isUserConfig = this.properties.isUserConfig;
    const requestSource = this.properties.context && this.properties.context.requestSource;
    this.portfolioCsmWidgetService.setRequestSource(requestSource);
    const isAdminPreview = requestSource === PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.GS_HOME_PREVIEW && this.properties.context.type === "ADMIN_PUBLISHED";
    const scope = requestSource.includes("DASHBOARD") ? PortfolioScopes.DASHBOARD : PortfolioScopes.GSHOME;
    this.subs.add(this.portfolioCsmWidgetService.getPortfolioConfig(this.portfolioId, isAdminPreview, scope).subscribe(response => {
      this.portfolioId = response.portfolioId;
      this.setWidgetConfig(response);
    }));
  }

  onWidgetLoaded() {
    if(!this.widgetLoadedFired) {
      this.dispatchWidgetEvents(WIDGET_EVENTS.WIDGET_RENDERED, WIDGET_RENDER_STATUS.SUCCESS);
      this.widgetLoadedFired = true;
    }
  }

  onWidgetDelete() {
    if(this.isUserConfig) {
      this.portfolioId = this.widgetConfig.portfolioAdminId;
      this.isUserConfig = false;
    }
  }

  getPropertiesToPersist() {
    return {
      ...this.properties,
      portfolioId: this.portfolioId,
      isUserConfig: this.isUserConfig
    }
  }

  getSourceDetails() {
    return [COMPANY_SOURCE_DETAILS, RELATIONSHIP_SOURCE_DETAILS];
  }

  isFilterable(): boolean {
    return true;
  }

  onFilterUpdate(globalFilter?: FilterInfo): void {
    this.setGlobalFilter(globalFilter);
  }

  subscribeForCompanyFields() {
    this.subs.add(this.portfolioCsmWidgetFacade.getCompanyFields$.subscribe(companyFieldTree => {
      if (companyFieldTree.fields.length && !this.describeFieldTreeMap.company.fields.length) {
        this.describeFieldTreeMap.company = companyFieldTree;
        this.portfolioWidgetService.setDescribeObjectFieldTree(companyFieldTree, PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME);
      }
    }));
  }

  subscribeForRelationshipFields() {
    this.subs.add(this.portfolioCsmWidgetFacade.getRelationshipFields$.subscribe(relationshipFieldTree => {
      if (relationshipFieldTree.fields.length && !this.describeFieldTreeMap.relationship.fields.length) {
        this.describeFieldTreeMap.relationship = relationshipFieldTree;
        this.portfolioWidgetService.setDescribeObjectFieldTree(relationshipFieldTree, PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME);
      }
    }));
  }

  fetchObjectDetails() {
    const host: HostInfo = this.getFieldTreeHostInfo(COMPANY_SOURCE_DETAILS);
    const relationshipHost: HostInfo = this.getFieldTreeHostInfo(RELATIONSHIP_SOURCE_DETAILS);
    this.portfolioCsmWidgetFacade.describeObject(host);
    this.portfolioCsmWidgetFacade.describeObject(relationshipHost);
  }

  getFieldTreeHostInfo(sourceDetails) {
    if (this.isExternalSharing()) {
      return {
        id: sourceDetails.connectionId,
        name: sourceDetails.objectName,
        type: sourceDetails.connectionType,
        apiVersion: 'v3',
        apiContext: 'bi/external/describe'
      };
    }
    return {
      id: sourceDetails.connectionId,
      name: sourceDetails.objectName,
      type: sourceDetails.connectionType,
      apiVersion: 'v3',
      apiContext: 'bi/reporting/describe'
    };
  }

  isExternalSharing():boolean {
    const GS = this.env.gsObject;
    return (GS && (GS.isESSharing || GS.resourceData));
  }

  openBulkEdit(): void {
    const modal = this.drawerService.create({
      nzContent: PortfolioBulkEditComponent,
      nzContentParams: {
        config: this.widgetConfig,
        configuredObjectNames: this.configuredObjectNames,
        filters: this.globalFilter,
        describeObjFields: this.describeFieldTreeMap
      },
      nzBodyStyle: {'padding-top' : '1rem'},
      nzWidth: '100vw',
      nzMaskClosable: true,
      nzTitle: this.widgetConfig.portfolioName,
      nzPlacement: 'right',
      nzOnCancel: (): Promise<boolean> => {
        this.showInlineEdit = true;
        modal.close();
        return Promise.resolve(true);
      }
    });

    // Adding this to just reload inline edit grid
    this.showInlineEdit = false;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
