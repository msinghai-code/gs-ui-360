import { Component, OnInit, Input, Inject, Output, EventEmitter, OnDestroy, ViewChild, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { IReportFilter } from '@gs/core';
import { GridRequestSource, PortfolioConfig, PortfolioGridActionInfo, PortfolioGridInfo, PortfolioGridState, PortfolioScopes, PortfolioWidgetGridComponent, PORTFOLIO_GRID_ACTIONS, PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { isEmpty, sortBy, forEach } from "lodash";
import { PortfolioAdminWidgetService } from '../portfolio-admin-widget.service';
import { SubSink } from 'subsink';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-portfolio-live-admin-grid',
  templateUrl: './portfolio-live-admin-grid.component.html',
  styleUrls: ['./portfolio-live-admin-grid.component.scss']
})
export class PortfolioLiveAdminGridComponent implements OnInit, OnChanges, OnDestroy {
  
  @ViewChild("portfolioGrid", { static: false }) portfolioGridComponent: PortfolioWidgetGridComponent;

  @Input() config: PortfolioConfig;
  @Input() globalFilter: IReportFilter;
  @Input() configuredObjectNames: string[];

  @Output() gridLoaded = new EventEmitter();
  @Output() gridInitialized = new EventEmitter();

  gridState: PortfolioGridState;
  widgetConfig: PortfolioConfig;
  requestSource = GridRequestSource.ADMINCONFIG;
  objectName: string;
  triggerReload = false;
  companyGridInfo: PortfolioGridInfo = <any>{};
  relationshipGridInfo: PortfolioGridInfo = <any>{};
  selectedGridInfo: PortfolioGridInfo = <any>{};
  applicableFilters: any;
  selectedTab = PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME;
  objectDetails = {company:"company", relationship:'relationship'};

  private tabSwitched = false;
  private subs = new SubSink();

  constructor(@Inject("envService") public env: EnvironmentService, 
  public cdr: ChangeDetectorRef,
  private portfolioAdminWidgetService: PortfolioAdminWidgetService) {
    this.subs.add(this.portfolioAdminWidgetService.portfolioDataObservable.subscribe(response => {
      if(response.configuration) {
        response.configuration.showFields = sortBy(this.config.configuration[this.objectName].showFields, ['displayOrder']);
      }
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
        this.selectedGridInfo = this.companyGridInfo = {
          ...this.companyGridInfo,
          reportMaster: response.configuration,
          data: response,
          triggerReload: this.triggerReload
        }
      } else {
        this.selectedGridInfo = this.relationshipGridInfo = {
          ...this.relationshipGridInfo,
          reportMaster: response.configuration,
          data: response,
          triggerReload: this.triggerReload
        }
      }
      this.tabSwitched = false; 
      this.triggerReload = false;
      this.gridInitialized.emit();
      this.cdr.detectChanges();
    }));
  }

  setReportMaster() {
    if(!this.tabSwitched) {
      this.objectName = this.selectedTab === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME && this.widgetConfig.configuration.company.showTab ? PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME : PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME;
    }

    this.setApplicableFilters();
    this.gridState = this.portfolioAdminWidgetService.getInitialGridState();
    this.gridState.portfolioId = this.widgetConfig.portfolioId;
    this.gridState.globalFilter = this.applicableFilters;
    this.portfolioAdminWidgetService.setGridState(this.gridState, this.objectName);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if((changes.config || changes.globalFilter) && this.config) {
      this.widgetConfig = this.config;
      this.triggerReload = true;
      this.setReportMaster();
    }
  }

  resizeGrid() {
    this.portfolioGridComponent.resizeToParentDimensions();
  }

  onGridAction(actionInfo: PortfolioGridActionInfo) {
    switch (actionInfo.action) {
      case PORTFOLIO_GRID_ACTIONS.GRID_READY:
        this.gridLoaded.emit();
        break;
      case PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE:
        this.gridState.pageSize = actionInfo.info;
        this.portfolioAdminWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.PREVIOUS_PAGE:
      case PORTFOLIO_GRID_ACTIONS.NEXT_PAGE:
        this.gridState.offset = actionInfo.info;
        this.portfolioAdminWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.SEARCH:
        this.gridState.offset = 0;
        this.gridState.whereFilters = actionInfo.info;
        this.portfolioAdminWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.SORT:
        this.gridState.orderByFields = actionInfo.info;
        this.portfolioAdminWidgetService.setGridState(this.gridState, this.objectName);
        break;
    }
  }

  onTabChange(event: any) {
    this.tabSwitched = true;
    // this.selectedTab = event.tab.nzTitle.toLowerCase();
    this.selectedTab = event.index === 0 ? 'company': 'relationship';
    this.objectName = this.selectedTab;
    this.setReportMaster();
  }

  setApplicableFilters(){
    if(this.config.portfolioScope !== PortfolioScopes.DASHBOARD) {
      this.applicableFilters = this.globalFilter;
      return;
    }
    let applicableFilters = {conditions: []};
    forEach(this.globalFilter, filter => {
      const companyFilter = filter.filter(widget => widget.sourceDetails.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) || [];
      const relationshipFilter = filter.filter(widget => widget.sourceDetails.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME) || [];
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME && companyFilter.length) {
        applicableFilters.conditions.push(companyFilter[0].filter);
      }
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME && relationshipFilter.length) {
        applicableFilters.conditions.push(relationshipFilter[0].filter);
      }
    });
    applicableFilters && applicableFilters.conditions.forEach(condition => {
        /* tslint:disable:no-string-literal */
        condition['rightOperandType'] = 'VALUE';
    });
    this.applicableFilters = applicableFilters;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
