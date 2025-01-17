import {
  CompanyHierarchyState,
  CompanyHierarchyViewLabels,
  COMPANY_HIERARCHY_MESSAGES,
  InitialHierarchyState, MiniPrefix, isCompanyNameField
} from '@gs/cs360-lib/src/common';
import {
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
    HostListener, Output, EventEmitter, ComponentFactoryResolver, Directive
} from '@angular/core';
import { CsmCompanyHierarchyService } from './csm-company-hierarchy.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
    AGGridColumn,
    AGGridConfig,
    GSGridApi,
    formatColumnDefinitionsForGrid,
    AGGridEditMode, setCustomCellRenderer
} from "@gs/gdk/grid";
import {
    ColumnApi
} from "@ag-grid-community/core";
import { LOADER_TYPE } from "@gs/gdk/spinner";
import { ObjectFilterQueryComponent } from "@gs/gdk/filter/builder";
import { FieldUtils, ReportFilterUtils, ReportUtils } from '@gs/report/utils';
import {operatorTranslation} from "../../../operator/operator-translation";
import {GSGlobalFilter} from "@gs/gdk/filter/global/core/global-filter.interface";
import {GSField, StateAction} from "@gs/gdk/core";
import { jsepCheck, removeLogicNode, getJSEPtoExpression } from "@gs/gdk/filter/builder";
import { fieldInfo2path } from "@gs/gdk/utils/field";
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import { FilterQueryBuilderComponent } from '@gs/gdk/filter/builder';
import { ALLOWED_HTML_TAG_FOR_STRING_DTS } from '@gs/gdk/grid';
import { isValidHTMLTagFromString } from "@gs/gdk/utils/common";
import { find, isEmpty, reverse, pick, includes, cloneDeep, forEach, sortBy, debounce, omit, difference } from 'lodash';
import { GlobalFilterService } from "@gs/gdk/filter/global";
import { ISection } from '@gs/cs360-lib/src/common';
import { SubSink } from 'subsink';
import { FormControl } from '@angular/forms';
import { setCellRenderer } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { SectionStateService } from '@gs/cs360-lib/src/common';
import { generateKey } from '@gs/cs360-lib/src/common';
import { EnvironmentService, UserService } from '@gs/gdk/services/environment';
// import { HealthScoreRendererComponent } from "@gs/portfolio-lib"
import { HealthScoreRendererComponent } from "@gs/cs360-lib/src/portfolio-copy"
import { NzI18nService } from "@gs/ng-horizon/i18n";
import { forkJoin } from "rxjs";
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from "@gs/cs360-lib/src/common";
import { MDA_HOST } from '@gs/cs360-lib/src/common';
import { DescribeService } from "@gs/gdk/services/describe";
import { NameRendererComponent } from './common.component';
import {TranslocoService} from '@ngneat/transloco';
import {NzModalRef, NzModalService} from "@gs/ng-horizon/modal";
import {CompanyHierarchyFilterViewComponent} from "./company-hierarchy-filter-view/company-hierarchy-filter-view.component";
import { isMini360, gridColumnMoved, gridColumnResized } from '@gs/cs360-lib/src/common/cs360.utils';
import {PageContext} from "@gs/cs360-lib/src/common";

@Component({
  selector: 'gs-csm-company-hierarchy',
  templateUrl: './csm-company-hierarchy.component.html',
  styleUrls: ['./csm-company-hierarchy.component.scss']
})
export class CsmCompanyHierarchyComponent implements OnInit, OnDestroy {


  @ViewChild(FilterQueryBuilderComponent, {static: false}) fq: FilterQueryBuilderComponent;

  @ViewChild('drawerHost', {static: true}) drawerHostRef: ElementRef;

  section: ISection;
  showError: boolean = false;
  listViewResponse: any;
  responseData: any;
  chartViewResponse: any;
  selectedView = CompanyHierarchyViewLabels.LIST;
  gridConfig: any;
  views = CompanyHierarchyViewLabels;
  map = {
    mapOptions: {
      levelSeparation: 100,
      primaryNode: ''
    },
    data: null,
    config: null,
    showHierarchyWarning: false
  };
  public genericDrawer = {
    componentRef: null,
    title: 'Add Record',
    width: '50rem',
    showReset: false
  };
  showFilter = false;
  showMini360Filter = false;
  gridApi: GSGridApi;
  columnApi: ColumnApi;
  gridColumnApi: any;
  filterConfig: any = {};
  currencyConfig = {};
  displayedMapData;
  globalFilterConstants: any;
  searchInput = new FormControl();
  searchTerm: string;
  loading = true;
  error;
  modalRef: NzModalRef;
  loaderOptions = {
    loaderType: LOADER_TYPE.SVG,
    loaderParams: {
      svg_url_class: 'gs-loader-vertical-bar-skeleton',
      svg_wrapper_class: 'gs-loader-vertical-bar-skeleton-wrapper-opacity'
    }
  }
  filter =  {conditions: [], expression: "", columns: []};
  state: any = {};
  layoutId: string;
  isMini360: boolean = false;
  @Output() action = new EventEmitter<StateAction>();

  private subs = new SubSink();
  
  constructor(private cfr: ComponentFactoryResolver,
    private hierarchyService: CsmCompanyHierarchyService,
    private gfs: GlobalFilterService,
    private stateService: SectionStateService,
    private router: Router,
    @Inject("envService") private env: EnvironmentService,
    private userService: UserService,
    private i18nService: NzI18nService,
    private _ds:DescribeService,
    private translocoService: TranslocoService,
    private modalService: NzModalService,
    protected viewContainerRef: ViewContainerRef,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.filterConfig = this.getFilterConfig();
    this.subscribeToStateChange();
    this.loadState();
    this.setCurrencyConfig();
    this.subscribeForSearchInput();
  }

  private loadState() {
    this.layoutId = this.env.moduleConfig.layoutData.layout.layoutId;
    const pageContext = this.ctx.pageContext && this.ctx.pageContext.toLowerCase()
    const moduleName = isMini360(this.ctx)? (MiniPrefix+ pageContext).toLowerCase() : pageContext;
    this.subs.add(this.stateService.getState(this.layoutId, this.section.sectionId, moduleName).subscribe(res => {
      console.log(res);
      if(res && res.length && res[0] && !isEmpty(res[0].state)) {
        this.filter = {...res[0].state.filter};
        this.state = {...res[0].state, sectionId: this.section.sectionId};
        this.selectedView = res[0].state.view || CompanyHierarchyViewLabels.LIST;
        this.setColumnState();
      }
      this.hierarchyService.setCompanyHierarchyState(InitialHierarchyState(this.state,this.section.sectionId, this.filter));
    }));
  }


  private setColumnState() {
    if(this.gridColumnApi && this.state && this.state.columnState) {
      const currentState = this.gridColumnApi.getColumnState();
      const stateToApply = currentState.map(col => {
        const stateColumn = this.state.columnState.find(stateCol => col.colId === stateCol.colId);
        return {...col, ...pick(stateColumn, ["colId", "pinned", "width"])};
      });
      this.gridColumnApi.applyColumnState({state:stateToApply});
    }
  }

  private subscribeForSearchInput() {
    this.subs.add(this.searchInput.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((text: any) => {
      this.searchTerm = text;
      this.gridApi.setQuickFilter(this.searchTerm);
    }));
  }

  async setCurrencyConfig() {
    let currencyConfig = { showCurrency: false, currencyList: [] };
    if(this.env.multiCurrencyEnabled) {
      const config = await this.gfs.getCurrencyConfigForMDA();
      if(!!config && config.currencyOptions) {
        currencyConfig = {
          ...currencyConfig,
          showCurrency: true,
          currencyList: config.currencyOptions
        }
      }
    }
    this.currencyConfig = currencyConfig;
  }

  private getUserConfigByHostType(): any {
    return !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
  }

private saveState(columnState = this.gridColumnApi && this.gridColumnApi.getColumnState()) {
    const pageContext = this.ctx.pageContext && this.ctx.pageContext.toLowerCase()
    const moduleName = isMini360(this.ctx)? (MiniPrefix+ pageContext).toLowerCase() : pageContext;
    if(!this.state || (this.filter && (this.filter !== this.state.filter || this.state.view !== this.selectedView))) {
      this.subs.add(this.stateService.saveState({
          referenceId: `${this.layoutId}_${this.section.sectionId}`,
          state: {
              filter: this.filter,
              view: this.selectedView,
              columnState:this.isMini360 ? this.state.columnState : columnState
          },
          "entityType": this.ctx.pageContext === PageContext.C360 ? 'Company' : 'Relationship',
          moduleName: moduleName,
          "gsEntityId":"default"
      }).subscribe(res => {
        this.state = res.state;
      }));
    }
  }

  private getFilterConfig() {
    const host = this.env.instanceDetails;
    const user = this.getUserConfigByHostType();
    if(!!host) {
      const locale = host.locale;
      const currency = host.currency;
      const search = this.env.hostDetails.search;
      return {
        locale,
        currency,
        search,
        user,
        nestOnDemand: false,
        showLookupInfo: true,
        // Added fiscal support.
        // dateLiterals: operatorTranslation.getDateLiterals(),
        // Added operator map
        operatorMap: operatorTranslation.getOperatorMap(this.translocoService),
        // Added includes null
        honorIncludeNulls: true,
        // Check for strictness of expression
        strictCheck: true,
        // Show skeleton
        showSkeleton: true,
        // Added isApplicable option to rule
        honorIsApplicable: true,
        enablePartialTree: false,
        showValidationsOnTouch: false,
        pageSize: 200,
        getDefaultOperator: (selectedField, operatorsList) => {
          if(selectedField.data.meta && selectedField.data.meta.nameField) {
            return "EQ"
          } else {
            return operatorsList.find(op => op.default).value;
          }
        }
      };
    }
  }

  private subscribeToStateChange() {
    this.subs.add(this.hierarchyService.dataFetchSubject.subscribe(state => {
      if(this.selectedView === CompanyHierarchyViewLabels.LIST) {
        this.fetchDataForGrid(state, () => {
          this.fetchDataForChart(state);
        });
      } else {
        this.fetchDataForChart(state, () => {
          this.fetchDataForGrid(state);
        });
      }
    }));
  }

  /**
   * Delete filter conditions whose left operand is not present in listView or chartView
   */
  private updateFilters() {
    if(
      !this.filter
      || !this.filter.conditions
      || !(this.listViewResponse && this.listViewResponse.config && this.listViewResponse.config.columns)
      || !(this.chartViewResponse && this.chartViewResponse.config && this.chartViewResponse.config.columns)
      ) {
      return;
    }

    const allFieldsKeys = [...this.listViewResponse.config.columns, ...this.chartViewResponse.config.columns].map(col => generateKey(col));

    if(!allFieldsKeys.length) {
      return;
    }

    const before = this.filter.conditions.length;
    this.filter.conditions = this.filter.conditions.filter(condition => {
      const key = generateKey(condition.leftOperand);
      if(generateKey(condition.leftOperand) === 'Name') {
        return true;
      }
      const exists = allFieldsKeys.find(deletedFieldKey => deletedFieldKey === key || (deletedFieldKey.split('_').includes(key)));

      if(!exists) {
        this.updateExpression(condition.filterAlias);
        console.log('Removing condition having field: ', condition.leftOperand);
      }

      return exists;
    });

    
    if(before !== this.filter.conditions.length) {
      this.filter = { ...this.filter };
      this.onRefresh();
      this.saveState(null);
    }
  }

  private fetchDataForGrid(state: CompanyHierarchyState, callback?) {
    this.subs.add(
      forkJoin(
        [
          this.hierarchyService.fetchData(state, CompanyHierarchyViewLabels.LIST),
          this._ds.getObjectTree(MDA_HOST, Cs360ContextUtils.getBaseObjectName(this.ctx), 2, null, {skipFilter: true})
        ]
        ).subscribe(([response, tree]) => {
          const allColumns = response.data.config.columns;
          allColumns.forEach(element => {
            const path = fieldInfo2path({leftOperand:element},tree.children);
            const describeField = path[path.length - 1];
            element.meta = describeField && describeField.data && describeField.data.meta;
          });

          if(callback) {
            callback();
          }
          this.listViewResponse = response.data;
          this.responseData = response.data;
          this.updateFilters();
          this.updateColumnState();
          if(this.checkForErrors(this.listViewResponse)) {
            this.loading = false;
            return;
          }
          this.setGlobalFilterConstants();
          this.modifyGridData();
          this.creategridConfig();
          setTimeout(() => {
            this.setColumnState();
          });
          if(this.selectedView === CompanyHierarchyViewLabels.LIST) {
            this.loading = false;
          }
        })
    );
  }

  private updateColumnState() {
    if(!this.listViewResponse || !this.listViewResponse.config || !this.listViewResponse.config.columns || !this.state || !this.state.columnState) {
      console.info('Something is missing, either listViewResponse.config.columns or state.columnState');
      return;
    }

    const listViewColumnKeys = []; 
    this.listViewResponse.config.columns.filter(col => !col.hidden && generateKey(col) !== 'Name').map(col => {
      if(col.properties && col.properties.rollup){
        listViewColumnKeys.push(col.properties.agg_alias);
      }
      listViewColumnKeys.push(generateKey(col));
    });
    if(!this.isMini360) {
        const stateColumnKeys = this.state &&  this.state.columnState.filter(col => col.colId !== 'ag-Grid-AutoColumn' && !col.hide).map(col => col.colId);

        const addedFields = difference(listViewColumnKeys, stateColumnKeys);
        const deletedFields = difference(stateColumnKeys, listViewColumnKeys);

        // If new fields are added or existing fields are removed, reset state.
        if(this.state && (addedFields.length || deletedFields.length)) {
            this.state.columnState = null;
            this.saveState(null);
            console.log('COLUMN STATE CLEARED');
        }
    }

  }

  private updateExpression(removeAlias: string) {
    let jsepParsedExp = jsepCheck(this.filter.expression);
    if (removeAlias) {
      jsepParsedExp = removeLogicNode(jsepParsedExp, removeAlias, true);
    }
    this.filter.expression = getJSEPtoExpression(jsepParsedExp) || '';
  }

  private checkForErrors(response: any) {
    if(isEmpty(response)) {
      this.error = this.i18nService.translate(COMPANY_HIERARCHY_MESSAGES.NOT_CONFIGURED);
      return true;
    }
    const parentCompanyFieldAlias = response.config.columns.find(col => col.fieldName === "ParentCompany").fieldAlias; 
    const gsidFieldAlias = response.config.columns.find(col => col.fieldName === "Gsid").fieldAlias; 
    let circularRecords = false;
    forEach(response.data, (record: any) => {
      const parentCompany = find(response.data, rec => rec[gsidFieldAlias].k === record[parentCompanyFieldAlias].k);
      if(parentCompany && parentCompany.level > record.level) {
        circularRecords = true;
      }
		});
		if (circularRecords) {
			this.error = this.i18nService.translate(COMPANY_HIERARCHY_MESSAGES.CIRCULAR_RECORDS_ERROR);
			return true;
		}
  }

  private setGlobalFilterConstants() {
    this.globalFilterConstants = {
      TOKENIZED: true,
      HOST: { id: "mda", name: "mda", type: "mda", apiContext : 'api/reporting/describe' },
      BASE_OBJECT: 'company',
      OBJECT_LIST: [{
        objectLabel: "Company",
        objectName: "company",
        excludeFields: [],
        nestLevels: 2
      }],
      NEST_LEVELS: 2,
      ADD_DEFAULT_RULE: false,
      EMPTYGLOBALFILTERS : {
          "conditions": [],
          "expression": ""
      }
    };
  }

  private fetchDataForChart(state: CompanyHierarchyState, callback?) {
    this.subs.add(
      forkJoin(
        [
          this.hierarchyService.fetchData(state, CompanyHierarchyViewLabels.CHART),
          this._ds.getObjectTree(MDA_HOST, Cs360ContextUtils.getBaseObjectName(this.ctx), 2, null, {skipFilter: true})
        ]
        ).subscribe(([response, tree]) => {
          const allColumns = response && response.data.config.columns;
          allColumns.forEach(element => {
            const path = fieldInfo2path({leftOperand:element},tree.children);
            const describeField = path[path.length - 1] && path[path.length - 1].data;
            element.meta = describeField && describeField.meta;
          });

          if(callback) {
            callback();
          }
          this.chartViewResponse = response.data;
          this.updateFilters();
          if(this.checkForErrors(this.chartViewResponse)) {
            this.loading = false;
            return;
          }
          this.modifyChartData();
          this.map.showHierarchyWarning = this.chartViewResponse.data.findIndex(rec => rec.moreLevelsOnTop || rec.moreLevelsOnBottom) !== -1;
          this.map.config = sortBy(this.chartViewResponse.config.columns, col => col.properties && col.properties.chartFieldIndex);
          if(this.selectedView === CompanyHierarchyViewLabels.CHART) {
            this.loading = false;
          }
        })
    );
  }

  private modifyChartData() {
    // Note: No need of null check here as these fields will be available even though when not added in config (ParentCompany, Gsid, Name)
    const parentCompanyFieldAlias = this.chartViewResponse.config.columns.find(col => col.fieldName === "ParentCompany").fieldAlias;
    const gsidFieldAlias = this.chartViewResponse.config.columns.find(col => col.fieldName === "Gsid").fieldAlias; 
    const nameFieldAlias = this.chartViewResponse.config.columns.find(col => isCompanyNameField(col)).fieldAlias;
    const booleanFields = this.chartViewResponse.config.columns.filter( col => col.dataType === "BOOLEAN");
    this.map.data = this.chartViewResponse.data.map(row => {
      try {
        row.parentCompany = row[parentCompanyFieldAlias].k;
        row.name = row[nameFieldAlias].fv;
        row.gsid = row[gsidFieldAlias].k;
        booleanFields.forEach(field => {
          this.translateBooleanField(row, field.fieldAlias);
        });
      }
      catch{}
      if(this.env.moduleConfig.layoutData.layoutResolverDTO.companyId === row.gsid) {
        this.map.mapOptions.primaryNode = row.gsid;
      }
      row["pid"] = row.parentCompany || null;
      row.name = row.name;
      row.childCount = row.childCount ? row.childCount.fv : 0;
      row.id = row.gsid;
      return row;
    });
    this.displayedMapData = cloneDeep(this.map.data);
  }

  private changeNoDataOverlay(data: any) {
    if(this.gridApi && isEmpty(data)) {
      this.gridApi.showNoRowsOverlay();
    } else if(this.gridApi){
      this.gridApi.hideOverlay();
    }
  }
  translateBooleanField(row, fieldAlias) {
    const field = row[fieldAlias];

    if(!field) {
      return;
    }

    if ((field.fv === "false" || field.v === false)) {
      field.fv = this.i18nService.translate('360.admin.boolean_options.false');
    }
    else if ((field.fv === "true" || field.v === true)) {
      field.fv = this.i18nService.translate('360.admin.boolean_options.true');
    }
  }

  private modifyGridData() {
    this.changeNoDataOverlay(this.listViewResponse.data);
    // Note: No need of null check here as these fields will be available even though when not added in config (ParentCompany, Gsid, Name, Status)
    const parentCompanyFieldAlias = this.listViewResponse.config.columns.find(col => col.fieldName === "ParentCompany").fieldAlias;
    const gsidFieldAlias = this.listViewResponse.config.columns.find(col => col.fieldName === "Gsid").fieldAlias;
    const nameFieldAlias = this.listViewResponse.config.columns.find(col => isCompanyNameField(col)).fieldAlias;
    const statusFieldAlias = this.listViewResponse.config.columns.find(col => col.fieldName === "Status").fieldAlias;

    const booleanFields = this.listViewResponse.config.columns.filter( col => col.dataType === "BOOLEAN");
    this.listViewResponse.data = this.listViewResponse.data.map(row => {
      try {
        row.parentCompany = row[parentCompanyFieldAlias].k;
        row.name = row[nameFieldAlias].fv;
        row.status = row[statusFieldAlias].fv;
        row.statusClass = row[statusFieldAlias].sn;
        row.gsid = row[gsidFieldAlias].k;

        booleanFields.forEach(field => {
          this.translateBooleanField(row, field.fieldAlias);
        });
      }
      catch{}
      row["pid"] = row.parentCompany || null;
      row["isCurrent"] = this.env.moduleConfig.layoutData.layoutResolverDTO.companyId === row.gsid ? true : false;
      return row;
    });
    const current = this.listViewResponse.data.find(x => x.isCurrent);
    if(current) {
      this.setExpanded(this.listViewResponse.data,current.parentCompany || null);
    }
  }


  private setExpanded(data,id?: any) {
    if(!id)
      return
    else{
      let pData = find(data, item=>item.gsid === id);
      if(pData) {
        pData.expanded = true;
        this.setExpanded(data,pData.pid);
      }
    }
  };

  private getColumnDefs(columns) {
    const cols = [];
    let columnsFromListView = this.listViewResponse.config.columns;
    if(isMini360(this.ctx)) {
      const sortedColumns = sortBy(columns, col => col.displayOrder);
      if(sortedColumns && sortedColumns.length > 0) {
        columnsFromListView = sortedColumns.filter(col => this.listViewResponse.config.columns.find(c => c.fieldAlias === col.fieldAlias))
      }
    }
    columnsFromListView.forEach(col => {
      col.fieldAlias = col.fieldAlias ? col.fieldAlias : (this.listViewResponse.config.columns.find(c => c.fieldName === col.fieldName  && c.objectName === col.objectName) || col).fieldAlias;
      col.field = col.fieldAlias;
      delete col.type;
      col.hide = col.hidden || (isCompanyNameField(col) && !col.fieldPath);
      if(col.hidden) {
          col.hide =true;
      }
        if(isMini360(this.ctx)){
          col.properties = col.properties || {};
          /*col.width = col.properties.width || 140;*/
          col.minWidth = isCompanyNameField(col) ? col.properties.width : 100;
        }
      if(col.properties && col.properties.rollup){
        delete col.headerName;
        const rollUpColumn =  {...col};
        rollUpColumn.fieldName = col.properties.agg_alias;
        rollUpColumn.fieldAlias = col.properties.agg_alias;
        rollUpColumn.field = col.properties.agg_alias;
        const aggrType = col.aggregateFunction;
        rollUpColumn.headerComponentParams = {};
        //{360.csm.company_hierarchy_roll_up}=Roll Up
        //{360.csm.company_hierarchy_own}=Own
        const own_key = this.i18nService.translate('360.csm.company_hierarchy_own')
        const headerName =  this.i18nService.translate('360.csm.company_hierarchy_roll_up') + " ("+ aggrType.toUpperCase()+")";
        const nodesList = isValidHTMLTagFromString(col.label ? col.label : '', ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
        if (nodesList.length) {
          col.label = col.label ? escape(col.label) : "";
        } else {
          col.label = col.label;
        }
        rollUpColumn.headerComponentParams.template = this.getHeaderTemplate("<span class='topHeaderRow'>"+col.label+"</span><span class='secondHeaderRow'>"+headerName+"</span>");
        rollUpColumn.headerTooltip = col.label + " (" + aggrType.toUpperCase() + ")";
        cols.push(this.setGridColumnProperties(rollUpColumn));
        col.headerComponentParams = {};
				col.headerComponentParams.template = this.getHeaderTemplate('<span class="topHeaderRow">' + col.label+ '</span><span class="secondHeaderRow">' + own_key+ '</span>');
				col.headerTooltip = col.label + " (OWN)";
      }
      cols.push(this.setGridColumnProperties(col));
    });
    let gridColumns: AGGridColumn[] = formatColumnDefinitionsForGrid({
      columns: cols,
      additionalProps: {
      enableTooltip: true,
      lockPinned: true,
      }, callbacks: {
        tooltipCallback: (key, dataType) => {
          const currenntScoreCol = this.listViewResponse.config.columns.find(col => col.fieldName === "CurrentScore");
          const prevScoreCol = this.listViewResponse.config.columns.find(col => col.fieldName === "PreviousScore");
          if(currenntScoreCol && key === currenntScoreCol.fieldAlias) {
            return ""
           } else if(prevScoreCol && key === prevScoreCol.fieldAlias ){
              return ""
            } else {
              if(dataType === "NUMBER"){
                  return (params)=> params.value && params.value.fv ? decodeURIComponent((params.value.fv)).replace(/<\/?[^>]+>/gi, " ").replace(/&amp;/g, '&').replace(/&nbsp;/g, ''):  "";
              } else {
                  return this.setToolTipValueGetter(key, dataType);
              }

          }
        }
      }
    });
    gridColumns.forEach(col => {
      col.colId = generateKey(col) || col.colId;
    })
    if(isMini360(this.ctx)){
      const finalArray = this.state && this.state.columnState &&
      this.state.columnState.length ? gridColumns : [
            gridColumns.find((col)=> isCompanyNameField(col)),
            ...gridColumns.filter(col => !col.hidden && !isCompanyNameField(col)).slice(0, 3),
          ];
      gridColumns = [...finalArray, this.getColumnChooser(cols, finalArray)];
      if(!(this.state && this.state.columnState)){
        this.state.columnState = [...finalArray];
      }
    }
    return gridColumns;
  }

  getColumnChooser(columns, selectedColumns){
      return {
          colId: "column_chooser",
          field: "column_chooser",
          headerName: "",
          width: 50,
          minWidth: 50,
          maxWidth: 50,
          pinned: "right",
          lockPinned: true,
          columnDataType: "column_chooser",
          headerComponent: "gsColumnChooserRendererComponent",
          headerComponentParams: {
              columns: this.responseData.config.columns.filter(col => !col.hidden),
              disabledFields: ["Company Name"],
              applyColumnSelection: (selectedColumns) => {
                  this.onColumnUpdated(selectedColumns);
              },
              selectedColumns: selectedColumns,
              dataKey: "label",
              maxSelectionAllowed: 4,
          }
      }
  }

    onColumnUpdated(updatedColumns: any[]): void {
        // State preserve these columns.
        if(isMini360(this.ctx)) {
            // TODO: Needed or not
            let updatedColsArr = [];
            this.listViewResponse.config.columns.forEach(col => {
                if(updatedColumns.indexOf(col.label) > -1) {
                    col.displayOrder = col.fieldName === "Name" ? 0 : updatedColumns.indexOf(col.label);
                    updatedColsArr.push(col);
                } else {
                    col.displayOrder = updatedColumns.length++;
                }
            });
            //this.listViewResponse.config.columns = sortBy(this.listViewResponse.config.columns, col => col.displayOrder);
            this.gridConfig.options.columnDefs = this.getColumnDefs(updatedColsArr);
            this.state.columnState = [...updatedColsArr];
            this.saveState();
        }

    }

  public onColumnAction(event) {
      if(event.type === "COLUMN_MOVED" ){
          if(isMini360(this.ctx)) {
              this.state.columnState = gridColumnMoved(event, this.state.columnState, 'Name', true, this.columnApi);
          } else {
              this.columnApi && this.columnApi.applyColumnState({state: event.payload.colsState,
                  applyOrder: true});
          }
          this.saveState();
      } else if (event.type === "COLUMN_RESIZE") {
          if (isMini360(this.ctx)) {
              this.state.columnState = this.state.columnState.map((col)=> {
                return {
                  ...col,
                  width: event.payload.colsState.find((column)=>
                      column.colId === (col.colId || col.fieldName)).width
                }
              });
              // var allColIds = this.gridColumnApi.getAllColumns()
              //     .map(column => column.colId);
              // this.gridColumnApi.sizeColumnsToFit();
          }
        this.saveState();
      }
  }

    public setToolTipValueGetter(field, dataType) {
        let toolTipValueGetter;
        switch (field) {
            case 'navigation_column':
            case 'status_column':
                toolTipValueGetter = (params) => ((params.value && (params.value.label || params.value.statusLabel)) || params.value);
                break;
            default: toolTipValueGetter = (params) => {
                if (dataType.toUpperCase() === 'RICHTEXTAREA' && params.value) {
                    return params.value;
                } else {
                    return params.valueFormatted !== undefined ? params.valueFormatted : params.value;
                }
            };
        }
        return toolTipValueGetter;
    }

  private getHeaderTemplate(customHeaderTextTemplate: string) {
    return '<div class="ag-cell-label-container" role="presentation">' +
    '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
    '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
    '    <div class="ag-header-cell-text" role="columnheader">' +
       customHeaderTextTemplate +
    '	 </div>' +
    '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>' +
    '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>' +
    '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>' +
    '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>' +
    '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
    '  </div>' +
    '</div>'
  
  }

  private setGridColumnProperties(col: any) {
    const derivedColDatatype: string = FieldUtils.getFieldDerivedDatatype(col).toUpperCase();
    col.valueFormatter = ReportUtils.valueFormatter({dataType: derivedColDatatype},{honorNulls: false, showFormattedValue: true});
    col.getQuickFilterText = () => '';
    col.sortable = col.properties && col.properties.sortable;
    col.sortingOrder = ReportUtils.getDefaultSortingOrder(col);
    let cellRenderer;
    if(["CurrentScore", "PreviousScore"].includes(col.fieldName)) {
      col.cellRenderer = HealthScoreRendererComponent;
        col.comparator = this.getColComparator("SCORE");
    } else {
      cellRenderer = setCellRenderer(col, derivedColDatatype);
        col.comparator = this.getColComparator(derivedColDatatype);
    }
    if(!isEmpty(cellRenderer)) {
      col = {...col, ...cellRenderer};
    }
    return col;
  }

  private getColComparator(derivedColDatatype) {
    let comparator;
    if(derivedColDatatype === DataTypes.NUMBER || derivedColDatatype === DataTypes.CURRENCY || derivedColDatatype === DataTypes.PERCENTAGE){ 
      comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
          return (valueA.k || 0) - (valueB.k || 0);
      }
    } else if(derivedColDatatype === DataTypes.STRING || derivedColDatatype === DataTypes.BOOLEAN) {
      comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
        const valueALower = valueA && valueA.fv.toLowerCase().trim();
        const valueBLower = valueB && valueB.fv.toLowerCase().trim();
        return valueALower.localeCompare(valueBLower, 'en', { numeric: true });
      }
    } else if(derivedColDatatype === DataTypes.DATE || derivedColDatatype === DataTypes.DATETIME) {
      comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
        return valueA && valueB && valueA.k - valueB.k;
      }
    } else if(derivedColDatatype === "NAME") {
      comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
        const valueALower = nodeA.data && nodeA.data.name.toLowerCase().trim();
        const valueBLower = nodeB.data && nodeB.data.name.toLowerCase().trim();
        return valueALower.localeCompare(valueBLower, 'en', { numeric: true });
      }
    } else if(derivedColDatatype === "SCORE") {
        comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
            return ((valueB && valueB.properties &&valueB.properties.score) || 0) - (valueA && valueA.properties && valueA.properties.score || 0);
        }
    }
    return comparator;
  }

  private creategridConfig() {
    const options: AGGridConfig = {
      columnDefs: this.getColumnDefs((this.state && this.state.columnState) || this.listViewResponse.config.columns),
      defaultColDef: {
        filter: false,
          // if not mini 360 take the default minwidth of 200
        minWidth: isMini360(this.ctx)? 100 : 200
      },
      pagination: true,
      getRowClass: params => params.data.moreLevelsOnTop ? "more-top-row" : [],
      paginationPageSize: 50,
      getRowNodeId: (data) => data.gsid,
      treeData: true,
      getDataPath: (params) => {
        return this.getHierarchy(params, [])
      },
      onGridReady: (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        if(!this.isMini360){
          params.columnApi.autoSizeColumn("company_name");
        }
        this.gridApi.setQuickFilter(this.searchTerm);
        params.api.forEachNode(node => {
          if (node.data.expanded) {
            node.setExpanded(true);
          }
        });
        this.setColumnState();
      },
      onRowDataChanged: () => {
        if(this.gridApi) {
          this.gridApi.setQuickFilter(this.searchTerm);
          this.gridApi.forEachNode(node => {
            if (node.data.expanded) {
              node.setExpanded(true);
            }
          });
        }
      },
      excludeChildrenWhenTreeDataFiltering: true,
      animateRows: true,
      onFilterChanged: (params) => {
        const filteredNodes = [];
        params.api.forEachNodeAfterFilter(node => {
          if (node.data.expanded) {
            node.setExpanded(true);
          }
          filteredNodes.push(node.data.name);
        });
        this.changeNoDataOverlay(filteredNodes);
        this.map.data = this.displayedMapData.filter(x => includes(filteredNodes, x.name));
      },
      getRowHeight: (params) => {
        if(params.data.moreLevelsOnTop || params.data.moreLevelsOnBottom) {
          return 60;
        } else {
          return 45;
        }
      },
      //{360.csm.company_hierarchy.company_name}=Company Name
      autoGroupColumnDef: {
				headerName: this.i18nService.translate('360.csm.company_hierarchy.company_name'),
				sort: 'asc',
        colId: "company_name",
        // field:'Company Name',
        sortingOrder: ["asc", "desc"],
        pinned: true,
        lockPinned: true,
		// suppressResize: false,
        valueFormatter: ReportUtils.valueFormatter(),
        comparator: this.getColComparator("NAME"),
        tooltipValueGetter: params => params.data.name,
		minWidth: isMini360(this.ctx) ? 150: 300,
        getQuickFilterText: (params) => params.data.name,
        cellRendererParams: {
					suppressCount: true,
          myParams: (params) => params,
					innerRenderer: NameRendererComponent
				}
			}
    };
    ////{360.csm.company_hierarchy.no_records_title}=No records found
    //{360.csm.company_hierarchy.no_records_message}=Try adjusting your search.
    this.gridConfig = {
      options: {
        ...options,
        noRowsOverlayComponentParams: {
          title: this.i18nService.translate('360.csm.company_hierarchy.no_records_title'),
          message: this.i18nService.translate('360.csm.company_hierarchy.no_records_message')
        },
        autoResizeColumnsToFit: true,
        additionalProps: {lockPinned: true}
      },
      data: this.listViewResponse.data,
      // mode: AGGridEditMode.NONE,
      additionalOptions: {}
    }
  }

  // private getNameRenderer(params: any) {
  //   let name = params.data.name;
  //   try {
  //     // Show only innerText for the HTML strings
  //     const nodesList = isValidHTMLTagFromString(name ? name : '', ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
  //     if (nodesList.length) {
  //       name = name ? escape(name) : "";
  //     } else {
  //       name = name;
  //     }
  //   } catch (e) {
  //     // Fallback to pristine formatted value.
  //     name = name;
  //   }
  //   const link = this.getNameHyperLinks(params.data.gsid);
  //   if(params.data.isCurrent) {
  //     name = `<span class="name">${name}</span>`
  //   } else {
  //     name = `<a class="name" href="${link}" target="_blank">${name}</a>`
  //   }
  //   const className = params.data.statusClass ? params.data.statusClass.toLowerCase() : "";
  //   name = `<nz-badge class=${className}></nz-badge>` + name;
  //   if(params.data.isCurrent) {
  //     //{360.csm.company_hierarchy.current}=Current
  //     //{360.csm.company_hierarchy.levels_top}=There are more levels on top
  //      //{360.csm.company_hierarchy.levels_bottom}=There are more levels on bottom
  //       let currentText = this.i18nService.translate('360.csm.company_hierarchy.current');

  //     name = `<span class="hierarchy-name hierarchy-current">` + name + ` <nz-tag><span>`+currentText+`</span></nz-tag></span>`;
  //   } else {
  //     name = `<span class="hierarchy-name">` + name + `</span>`;
  //   }
  //   if(params.data.moreLevelsOnTop) {
  //       let topLevels =this.i18nService.translate('360.csm.company_hierarchy.levels_top');
  //       name = `<span class="hierarchy-info"><span class="limit-info">`+topLevels+`</span>` + name + `</span>`;
  //   } else if(params.data.moreLevelsOnBottom) {
  //       let bottomLevels =this.i18nService.translate('360.csm.company_hierarchy.levels_bottom');
  //       name = `<span class="hierarchy-info">` + name + `<span class="limit-info">`+bottomLevels+`</span></span>`;
  //   }
  //   return name;
  // }

  // TODO: need to consume a util method
  private getNameHyperLinks(name: string) {
    const isSFDCHybrid = HybridHelper.isSFDCHybridHost();
    let c360Url = this.env.gsObject.uiBasePath + "customersuccess360?cid=" + name;
    if(isSFDCHybrid) {
      c360Url = HybridHelper.generateNavLink(c360Url);
    }
    return c360Url;
  }

  private getHierarchy(rec: any, hierarchy: any[]) {
		hierarchy.push(rec.gsid);
		const parentCompany = this.getParentCompany(rec, this.listViewResponse.data);
		if (parentCompany) {
			return this.getHierarchy(parentCompany, hierarchy);
		} else {
			return reverse(hierarchy);
		}
	}

  private getParentCompany(rec: any, sourceData: any[]) {
		return find(
			sourceData,
			dataRecord => dataRecord.gsid === rec.parentCompany
		);
	}

  onRefresh() {
    this.searchInput.reset();
    this.loading = true;
    this.hierarchyService.setCompanyHierarchyState({...this.hierarchyService.getCompanyHierarchyState(), whereClause: this.filter, state: this.state});
  }

  openFilterPopup(event: any) {
    this.showMini360Filter = isMini360(this.ctx);
    if(this.showMini360Filter){
      let fields: any[] = [];
      this.modalRef = this.modalService.create({
        nzTitle: this.i18nService.translate('360.csm.relationship_view.addFilter'),
        nzWidth: 820,
        nzContent: CompanyHierarchyFilterViewComponent,
        nzFooter: [
            {
                label: this.i18nService.translate('360.csm.relationship_view.cancel'),
                shape: "round",
                onClick: () => this.onCancel(),

            },
            {
                label: this.i18nService.translate('360.csm.relationship_view.save'),
                type: "primary",
                shape: "round",
                onClick: (contentComponentInstance) => this.onSave( contentComponentInstance)
            }
        ],
        nzComponentParams: {filters:{...this.filter, columns: [...this.listViewResponse.config.columns]}},
    })
    const widgetInstance = this.modalRef.getInstance() as any;
    widgetInstance.allowedFields = fields.map(f => {
        const {fieldName, dataType, fieldPath, label, objectName} = f;
        return {fieldName, dataType, fieldPath, label, objectName};
    });
    widgetInstance.filters = this.filter;
    } else {
      this.showFilter = true;
      const relationshipFilterViewComponentFactory = this.cfr.resolveComponentFactory(CompanyHierarchyFilterViewComponent);
      const viewContainerRef = this.viewContainerRef;
      viewContainerRef.clear();
      if(this.genericDrawer.componentRef) {
        this.genericDrawer.componentRef.destroy();
        this.genericDrawer.componentRef = null;
      }
      this.genericDrawer.componentRef = viewContainerRef.createComponent(relationshipFilterViewComponentFactory);
      const widgetInstance = this.genericDrawer.componentRef.instance as any;
      widgetInstance.filters =  {...this.filter, columns: [...this.listViewResponse.config.columns]};
      this.genericDrawer.componentRef.changeDetectorRef.detectChanges();
      widgetInstance.element = this.genericDrawer.componentRef.location.nativeElement;
      this.drawerHostRef.nativeElement.appendChild(widgetInstance.element);
    }
  }

  onCancel() {
    this.onDrawerClose();
  }

  onSave(content) {
      const data: StateAction = content.serialize();
              if(!!data.payload && data.payload.error) {
                  this.showError = true;
              } else {
                  // this.filterView.config = { ...this.filterView.config, filters: this.processFilters(data.payload) };
                  // this.showError = false;
                  // this.refreshView();
                  content.filters = data.payload;
                  this.onFilterPopupApplyMini360(content.filters);
                  // this.action.emit({
                  //     type: 'PRESERVE_STATE',
                  //     payload: { filters: data.payload }
                  // });
                  // this.onDrawerClose();
              }
  }

  onFilterPopupApplyMini360(content) {
    if(content) {
      this.showError = false;
      this.loading = true;
      // this.filter = (<FilterQueryBuilderComponent>this.fq).serialize();
      content.conditions.forEach(cond => {
        cond.filterValue.includeNulls = cond.includeNulls;
      });
      this.hierarchyService.setCompanyHierarchyState({...this.hierarchyService.getCompanyHierarchyState(), whereClause: content, state: this.state});
      this.filter = content;
      // this.showFilter = false;
      this.onDrawerClose();
      this.saveState();
      this.filter = content;
    } else {
      this.showError = true;
    }
  }

    public onDrawerClose() {
        // this.openDrawer = false;
        // this.showError = false;
        // if(this.genericDrawer.componentRef) {
        //     this.genericDrawer.componentRef.destroy();
        //     this.genericDrawer.componentRef = null;
        // }
        if(this.modalRef) {
            this.modalRef.destroy();
        }
    }

  onViewChange() {
    this.saveState();
  }

  onFilterPopupApply() {
    if(this.genericDrawer.componentRef && this.genericDrawer.componentRef.instance.serialize().payload && !this.genericDrawer.componentRef.instance.serialize().payload.error) {
      this.showError = false;
      this.loading = true;
      this.filter = this.genericDrawer.componentRef.instance.serialize().payload;
      this.filter.conditions.forEach(cond => {
        cond.filterValue.includeNulls = cond.includeNulls;
      });
      this.hierarchyService.setCompanyHierarchyState({...this.hierarchyService.getCompanyHierarchyState(), whereClause: this.filter, state: this.state});
      this.showFilter = false;
      this.saveState();
    } else {
      this.showError = true;
    }
  }

  onFilterPopupCancel() {
    this.filter = this.state && this.state.filter ? {...this.state.filter} :  {conditions: [], expression: ""};
    this.showError = false;
    this.showFilter = false;
  }

  fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
    const selectedFieldNames = [...this.listViewResponse.config.columns, ...this.chartViewResponse.config.columns].map(item => {
      if([DataTypes.MULTISELECTDROPDOWNLIST, DataTypes.IMAGE].includes(item.dataType)) {
        return "";
      }
      if((item.hide || item.hidden) && !uniqueKey) {
        return item.fieldName === "Status" || item.fieldName === "Name" ? item.fieldName : "";
      } else if(item.fieldPath) {
        if(uniqueKey === item.fieldPath.right.fieldName) {
          return item.fieldName;
        } else if(!uniqueKey){
          return item.fieldPath.right.fieldName;
        }
      } else if(!uniqueKey) {
        return item.fieldName;
      }
    });
    return fields.filter(item => {
        return includes(selectedFieldNames, item.fieldName);
    });
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
