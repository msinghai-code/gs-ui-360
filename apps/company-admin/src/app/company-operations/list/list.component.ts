import { Component, OnInit, ViewChild, ElementRef, ComponentFactoryResolver, Inject, OnDestroy } from '@angular/core';
import {
  AGGridAdditionalOptions,
  AGGridColumn,
  formatConfigObjectForGrid,
  setPaginatorOptions,
  formatColumnDefinitionsForGrid,
  formatAdditionalOptionsForGrid
} from "@gs/gdk/grid";
import {
    PaginatorAction,
    AGGridEditMode
} from "@gs/gdk/grid";
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import {NzModalRef, NzModalService} from '@gs/ng-horizon/modal';
import { forEach, size, filter, map, find, isEmpty, keys, each, includes, findIndex, orderBy, cloneDeep } from 'lodash';
import { IServerSideDatasource, IServerSideGetRowsParams, ColDef, ValueFormatterParams, ICellRendererParams, GridApi, RowSelectedEvent, GridReadyEvent } from '@ag-grid-community/core';
import { CompaniesFacade } from '../state/companies.facade';
import * as DataOperationsConstants from '../constants';
import { Subscription } from 'rxjs/internal/Subscription';
import { CompaniesFilterInfo, LoadCompaniesPayload, CompanyGridPageInfo, ContextMenuItem, CompanyFieldInfo, ContextMenuInfo } from '../interfaces';
import { CompanyGridUtils } from '../CompanyGridUtils';
import { Router, ActivatedRoute } from '@angular/router';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { takeUntil } from 'rxjs/operators';
import { CompanyOperationsBaseComponent } from '../company-operations-base/company-operations-base.component';
import { LogsComponent } from '../merge-logs/logs.component';
import {CurrencyService, EnvironmentService, UserService} from "@gs/gdk/services/environment";
import {GSWindow} from "@gs/gdk/core/types";
import {NzI18nService} from "@gs/ng-horizon/i18n";
declare let window: GSWindow;

@Component({
  selector: 'gs-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent extends CompanyOperationsBaseComponent implements OnInit, OnDestroy {

  // @ViewChild("contextMenuGrid", { static:true }) contextMenuGrid: PopoverComponent;
  companyData: any[];
  @ViewChild("contextMenuGrid", { static:true }) contextMenuGrid: NzOverlayComponent;
  @ViewChild('companyListGrid', { static:false }) set companyListGrid(companyListGrid: ElementRef) {
    if(companyListGrid) {
        this.companyListGridRef = companyListGrid;
    }
  }

  gridOptions: any;
  columnDefs: AGGridColumn[] = [];
  dataSource: IServerSideDatasource;
  columnsLoaded = false;
  loading = true;
  fields = [];
  headerMenuItems = [
    {label: DataOperationsConstants.CompanyListHeaderActionslabels.MERGE},
    {label: DataOperationsConstants.CompanyListHeaderActionslabels.REFRESH},
    {label: DataOperationsConstants.CompanyListHeaderActionslabels.MERGE_LOGS}
  ];
  additionalOptions: AGGridAdditionalOptions;
  filterQuery: CompaniesFilterInfo;
  contextMenuInfo: ContextMenuInfo = {
    contextMenuItems: [
      { id: DataOperationsConstants.CompanyListGridContextMenuItems.EDIT, icon: DataOperationsConstants.CompanyListGridContextMenuItems.EDIT, label: '360.list_comp.edit' },
      { id: DataOperationsConstants.CompanyListGridContextMenuItems.DELETE, icon: DataOperationsConstants.CompanyListGridContextMenuItems.DELETE, label: '360.list_comp.delete' }
    ]
  };
  selectedCompanies: any[] = [];
  numberOfRows: number;
  modalRef: NzModalRef;
  mergeModalref: NzModalRef;
  fieldSelected: boolean = false;

  private columns: CompanyFieldInfo[] = [];
  private inFrame = false;
  private isPaginationAction = false;
  private companyListGridRef: ElementRef;
  private gridAPI: GridApi;
  private columnsAPI;
  private pageInfo: CompanyGridPageInfo;
  private companyPayload: LoadCompaniesPayload;
  private companiesSubscription: Subscription;
  private params: any;
  private savedGridFilters: any;
  constructor(private companiesFacade: CompaniesFacade,
    private modalService: NzModalService,
    private _router: Router,
    private _route: ActivatedRoute,
   public userService: UserService,
    @Inject("envService") protected _env: EnvironmentService,
    private _cfr: ComponentFactoryResolver, private currencyService: CurrencyService, private i18nService: NzI18nService) {
    super();
    if(!this.companiesFacade.isCompanyObjectDefinitionLoaded()) {
      this.companiesFacade.loadCompanyObjectDefinition();
    }
    this.addListComponentInfoSubscription();
  }

  ngOnInit() {
    this.inFrame = (window.urlParams || {})['inFrame'] + '' === 'true';
    if (this.inFrame) {
      this.setContainerElementsStyles();
    }
    this.additionalOptions = formatAdditionalOptionsForGrid(true, false, {recordType: this.i18nService.translate(DataOperationsConstants.COMPANY_PAGINATOR_RECORD_TYPE), pageSizes: DataOperationsConstants.COMPANY_GRID_PAGE_SIZES});
    this.additionalOptions.customPaginator.onDemand = true;
    this.additionalOptions.noRowsOverlayComponentParams = {
      title: this.i18nService.translate('360.core.grid.nodata'),
      message: this.i18nService.translate('360.core.grid.nodataToShow')
    };
    this.configureGridOptions();
    this.addResetCompaniesSizeSubscription();
  }

  private setContainerElementsStyles() {
    const cdnVersionElement = document.querySelector(".gs-cdn-version") as HTMLElement;
      const tabsElement = document.querySelector(".gs-tabs") as HTMLElement;
      const companyAdminMainContainer = document.querySelector(".gs-tabs-container .gs-tabpanels-wrp .companyAdmin_main_ctn") as HTMLElement;
      const tabPanelsWrapElement = document.querySelector(".gs-tabs-container .gs-tabpanels-wrp") as HTMLElement;
      if(cdnVersionElement) {
        cdnVersionElement.style.display = "none";
      }
      if(tabsElement) {
        tabsElement.style.display = "block";
      }
      if(companyAdminMainContainer) {
        companyAdminMainContainer.style.padding = "0 1rem";
      }
      if(tabPanelsWrapElement) {
        tabPanelsWrapElement.style.margin = "1rem 0";
      }
  }

  private addListComponentInfoSubscription() {
    return this.companiesFacade.companyPayloadUpdated$
    .pipe(takeUntil(this.componentSubscription))
    .subscribe(payload => {
      if(!isEmpty(payload)) {
        this.companyPayload = cloneDeep(payload.payload);
        this.savedGridFilters = payload.gridFilters;
        this.addFilterInfoChangeSubscription();
      }
    });
  }

  private configureGridOptions() {
    this.gridOptions = formatConfigObjectForGrid({},{enableFloatingFilter: false});
    this.gridOptions.defaultColDef.sortable = false;
    this.gridOptions.suppressHorizontalScroll = false;
    this.gridOptions.defaultColDef.floatingFilter =  true;
    // this.gridOptions.frameworkComponents = {
    //       gsDropdownFloatingFilterComponent: DropdownFloatingFilterComponent,
    //       textFloatingFilterComponent: TextFloatingFilterComponent,
    //       dateFloatingFilterComponent: DateFloatingFilterComponent,
    //       numberFloatingFilterComponent: NumberFloatingFilterComponent
    //   };
    //   this.gridOptions.floatingFilter = true;
    this.gridOptions.rowSelection = 'multiple';
    this.gridOptions.rowMultiSelectWithClick = false;
    this.gridOptions.suppressRowClickSelection = true;
    this.gridOptions.serverSideStoreType='partial';
    this.gridOptions.onGridReady = (params: GridReadyEvent) => {
      this.gridAPI = params.api;
      this.columnsAPI = params.columnApi;
      if(!isEmpty(this.savedGridFilters)) {
        this.gridAPI.setFilterModel(this.savedGridFilters);
      }
    };
    this.gridOptions.onGridColumnsChanged = (params) => {
      const columns = params.columnApi.getAllDisplayedColumns();
      let columnWidth = 0;
      forEach(columns, column => columnWidth += column.getActualWidth());
      if(this.companyListGridRef && this.companyListGridRef.nativeElement.clientWidth > columnWidth) {
         params.api.sizeColumnsToFit();
      }
      if(this.params && !isEmpty(this.params.request.filterModel)) {
        this.gridAPI.setFilterModel(this.params.request.filterModel);
      }
    },
    this.gridOptions.onRowSelected = (params: RowSelectedEvent) => {
      const existingCompanyIndex = findIndex(this.selectedCompanies, company => company.Gsid === params.data.Gsid);
      if(params.node.isSelected() && existingCompanyIndex === -1) {
        this.selectedCompanies.push(params.data);
      } else if(existingCompanyIndex !== -1) {
        if(size(this.selectedCompanies) === 1) {
          this.selectedCompanies = [];
        } else {
          this.selectedCompanies.splice(existingCompanyIndex, 1);
        }
      }
    };
  }

  private addResetCompaniesSizeSubscription() {
    return this.companiesFacade.allCompaniesLoaded$
    .pipe(takeUntil(this.componentSubscription))
    .subscribe(response => {
      if(response.size !== undefined && !this.isPaginationAction) {
        this.numberOfRows = response.size;
        let numberOfPages = Math.abs(response.size/DataOperationsConstants.COMPANY_GRID_ROWS_LIMIT);
        if(response.size % DataOperationsConstants.COMPANY_GRID_ROWS_LIMIT > 0) {
          numberOfPages++;
        }
        this.companyPayload.offset = 0;
        if(!this.pageInfo) {
          this.pageInfo = {
            totalRecords: response.size,
            totalPages: numberOfPages,
            limit: DataOperationsConstants.COMPANY_GRID_ROWS_LIMIT,
            pageNumber: 1,
            nextAvailable: false,
            pageSize: DataOperationsConstants.COMPANY_GRID_PAGE_SIZES[0]
          };
        }
       this.additionalOptions.customPaginator = setPaginatorOptions(this.additionalOptions.customPaginator, this.pageInfo);
       this.additionalOptions.customPaginator.descriptionText =  this.i18nService.translate('360.admin.list_comp.Showing') + ' ${0} - ${1}';
        this.additionalOptions.customPaginator.onDemand = true;
        this.gridOptions.paginationPageSize = DataOperationsConstants.COMPANY_GRID_ROWS_LIMIT;
        this.gridOptions.pagination = false;
      }
    });
  }

  private addColumnsChangeSubscription() {
    return this.companiesFacade.fieldsUpdated$
    .pipe(takeUntil(this.componentSubscription))
    .subscribe((fields: any) => {
      if(fields && fields.length) {
        if(!this.columnsLoaded) {
          this.setDataSource();
          this.columnsLoaded = true;
        }
        this.fields = orderBy(fields, field => field.label.toUpperCase(), 'asc');
        this.configureColumnDefs();
      }
    });
  }

  private addFilterInfoChangeSubscription() {
    return this.companiesFacade.filterInfoUpdated$
    .pipe(takeUntil(this.componentSubscription))
    .subscribe((q: any | CompaniesFilterInfo) => {
      // const appConfig = this.companiesFacade.getAppConfig();
        console.log('query', q)
        const host = this._env.instanceDetails;
      const query = cloneDeep(q);
      if(!!host) {
        if (this.filterQuery === undefined) {
          this.filterQuery = {
            filterInfo: query.filterInfo || {
              config: {
                locale: host.locale,
                currency: host.currency,
                search: this._env.hostDetails.search,
                user: this.userService.gsUser || this._env.user,
                enablePartialTree: false,
                nestOnDemand: false,
                pageSize: 200,
                dateLiterals: [{ value: "CUSTOM", label: "Custom" }]
              },
              filterInfo: query.filterInfo || {
                expression: '',
                conditions: []
              },
              host: DataOperationsConstants.MDA_HOST,
              objectName: DataOperationsConstants.COMPANY_OBJECT_NAME
            },
          };
          this.companiesFacade.setIsCompanyObjectDefinitionLoaded(true);
          this.addColumnsChangeSubscription();
          this.filterQuery.filterConditions = query.filterConditions || null;
          this.companyPayload.where = query.filterConditions || null;
        } else {
          this.filterQuery.filterConditions = query.filterConditions || null;
          this.companyPayload.where = this.formFilterWhereInfo(this.params);
          if (!this.companyPayload.orderBy) {
            this.companyPayload.orderBy = { Name: 'asc' };
          }
          this.companiesFacade.loadAll(this.companyPayload, true);
        }
      }
    });
  }

  private formOrderByInfo(params: IServerSideGetRowsParams) {
    const sortInfo = {};
    forEach(params.request.sortModel, (model: any) => {
      sortInfo[model.colId] = model.sort;
    });
    return isEmpty(sortInfo) ? this.companyPayload.orderBy : sortInfo;
  }

  private formFilterWhereInfo(params: IServerSideGetRowsParams) {
    let expression = '';
    let conditions = [];
    if(!isEmpty(this.filterQuery.filterConditions)) {
      expression = this.filterQuery.filterConditions.expression;
      conditions = this.filterQuery.filterConditions.conditions;
    }
    const info = this.formFilterQuery(expression, conditions, params);
    return !size(info.conditions) ? null : info;
  }

  private formFilterQuery(expression, conditions, params) {
    forEach(params.request.filterModel, (value, key) => {
      expression = expression ? expression + " AND grid_" + size(conditions) : "grid_" + size(conditions);
      conditions.push({
        alias: 'grid_' + size(conditions),
        name: key,
        operator: DataOperationsConstants.GRIDTOSERVEROPERATORMAP[value.type && value.type.toUpperCase()] || value.type && value.type.toUpperCase(),
        value: value.filter ? value.filterTo !== null && value.filterTo !== undefined ? [value.filter, value.filterTo] : [value.filter] : value.dateTo ? [value.dateFrom, value.dateTo] : [value.dateFrom]
      });
    });
    return {expression, conditions};
  }

  getCurrentOffset(): number {
    return (this.companyPayload.limit * (this.pageInfo ? this.pageInfo.pageNumber - 1 : 0));
  }

  private onCompaniesLoaded(response, params, length) {
    const clonedResponse = cloneDeep(response);
    this.companyPayload.offset = 0;
    this.isPaginationAction = false;
    clonedResponse.map((data, index) => data['id'] = data['Gsid']);
    if(!clonedResponse.length) {
      params.api.showNoRowsOverlay();
    } else {
      params.api.hideOverlay();
    }
    this.params.successCallback(clonedResponse, length);
    this.loading = false; // need to add it to count subscription when count api is ready
  }

  private setDataSource() {
    this.dataSource = {
      getRows: (params: any) => {
        this.params = params;
        if(!this.isPaginationAction) {
          this.companyPayload.offset = 0;
          if(this.pageInfo) {
            this.pageInfo.pageNumber = 1;
          }
          if(this.additionalOptions && this.additionalOptions.customPaginator) {
            this.additionalOptions.customPaginator.currentPageNum = 1;
          }
        }

        // first 100 records
        this.loading = true;
        if(params.request.startRow === 0) {
          this.companyPayload.where = this.formFilterWhereInfo(params);
          this.companyPayload.orderBy = this.formOrderByInfo(params);
          this.companiesFacade.loadAll(this.companyPayload, !this.pageInfo);
          if(!this.companiesSubscription) {
            this.companiesSubscription = this.companiesFacade.companiesLoaded$
            .pipe(takeUntil(this.componentSubscription))
            .subscribe(response => {
              if(response) {
                this.companyData = response;
                this.onCompaniesLoaded(response, params, response.length);
              }
            });
          }
        }
        // next 100 records (data already available)
        else {
          const newData = this.companyData && this.companyData.slice(100);
          this.onCompaniesLoaded(newData, params, this.companyData && this.companyData.length)
        }
      }
    };
  }

  onFilterInfoChanged(filterInfo: CompaniesFilterInfo) {
    this.companiesFacade.onFilterInfoUpdated(filterInfo);
    this.gridAPI.refreshServerSideStore();
  }

  private configureColumnDefs() {
    this.columns = filter(this.fields, field => !field.hidden);
    this.companyPayload.select = map(this.columns, 'fieldName');
    const newColumnDefs: any[] = [];
    forEach(this.columns, column => {
      const columnDef: any = {
        headerName: column.label === "Name" ? this.i18nService.translate('360.list_comp.companyName') : column.label,
        field: column.fieldName,
        fieldName: column.fieldName, // ToDo: Remove this and set type to ColDef
        sortable: includes(DataOperationsConstants.UNSORTABLE_COLUMNS_DATATYPES, column.dataType) ? false : true,
        width: column.label === "Name" ? 400 : DataOperationsConstants.ColumnWidthMap[column.dataType] || 300,
        dataType: column.dataType,
        supressFilter: includes(DataOperationsConstants.UNSEARCHABLE_COLUMNS_DATATYPES, column.dataType) ? true : false,
        stopRowSelection: true,
        mappings:column.meta && column.meta.mappings ? true : false
      };
      columnDef.valueFormatter = (params: ValueFormatterParams) => CompanyGridUtils.getValueFormatter(params, this.fields, this._env, this.currencyService );
      columnDef.cellRenderer = (params: ICellRendererParams) => CompanyGridUtils.setCustomCellRenderer(params, this.fields, this._env);
      newColumnDefs.push(columnDef);
    });
    const columnsNew = formatColumnDefinitionsForGrid({columns: newColumnDefs, pinnedColumns: [{
      columnName: 'Name',
      pinnedPosition: "left",
      minWidth: 300
    },{
      columnName: 'action_column',
      pinnedPosition: "right"
    }],
    actionColumns: [DataOperationsConstants.ACTION_COLUMN_DETAIL],
    columnsSort: [{columnName: keys(this.companyPayload.orderBy)[0], sort: this.companyPayload.orderBy[keys(this.companyPayload.orderBy)[0]]}], additionalProps: {
      multipleRowSelection: {field: 'Name', allow: true},
      defaultColWidth: 200,
      lockPinned: true,
      enableTooltip: true
    }});
    this.columnDefs = map(columnsNew, columnDef => {
      if(columnDef.dataType) {
          // columnDef.enableTooltip = true;
        const findColumn = find(this.columns, column => column.fieldName === columnDef.field);
        const floatingFilter = CompanyGridUtils.setFloatingFilterComponent(findColumn.dataType, findColumn);
        columnDef = {...columnDef, ...floatingFilter};
        if(includes(DataOperationsConstants.UNSEARCHABLE_COLUMNS_DATATYPES, findColumn.dataType)) {
          columnDef = {...columnDef, ...{filter: null}};
        }
        if(columnDef.dataType === DataOperationsConstants.DataTypes.URL) {
          columnDef.tooltipValueGetter = (params) => CompanyGridUtils.getUrlTooltip(params);
         }
        // else {
        //     columnDef.tooltipValueGetter = (params) => {
        //         console.log('params', params.data[columnDef.field])
        //         return params.data[columnDef.field];
        //     }
        // }
      }
      return columnDef;
    });
  }

  onFieldsUpdated(fields: any[]) {
    this.companiesFacade.onFieldsUpdated(fields);
    // this.params.request.filterModel = {};
    // this.gridAPI.setFilterModel({});
    // this.gridAPI.refreshServerSideStore();
    // this.fieldSelected = true;
  }

  openContextMenu($event, data) {
    this.contextMenuInfo.selectedCompany = data;
    this.contextMenuGrid.open(new ElementRef($event.target));
  }

  onContextMenuAction($event: any, id) {
    switch(id) {
      case DataOperationsConstants.CompanyListGridContextMenuItems.DELETE: this.deleteSelected([this.contextMenuInfo.selectedCompany]); break;
      case DataOperationsConstants.CompanyListGridContextMenuItems.EDIT: this.loading = true;
        this.saveListComponentInfo();
        this._router.navigate(['upsert'], {queryParams: {id: this.contextMenuInfo.selectedCompany.Gsid}});
        break;
    }
  }

  private saveListComponentInfo() {
    const info = {payload: this.companyPayload, gridFilters: this.params.request.filterModel};
    this.companiesFacade.setListComponentInfo(cloneDeep(info));
  }

  openModalDialog(numberOfRows, companies, isResetSelectedCompanies?) {
    let graphUrl;
    const isHybrid = (window.urlParams || {})['isHybrid'] + '' === 'true';
    if (isHybrid) {
      const hybridHostURL = (window.urlParams || {})['hostUrl'];
      graphUrl = hybridHostURL + "#/v1/ui/company?#objectGraph";
    } else {
      graphUrl = "/v1/ui/company?#objectGraph";
    }
    const componentData = {
      numRows: numberOfRows,
      objectGraphUrl: graphUrl
    };
    this.modalRef = this.modalService.create({
      nzTitle: this.i18nService.translate('360.list_comp.deleteCompany'),
      nzWidth: 820,
      nzContent: DeleteConfirmationComponent,
        nzFooter: [
            {
                label: this.i18nService.translate('360.company-admin.merge_comp.Cancel'),
                shape: "round",
                onClick: () => this.onModalCancel(),

            },
            {
                label: this.i18nService.translate('360.company.admin.delete_operation_permanent_delete'),
                type: "primary",
                shape: "round",
                onClick: () => this.onOkClick(companies, isResetSelectedCompanies),
                disabled:  contentComponentInstance => contentComponentInstance.actions[0].disabled
            }

        ],
      // nzOnOk: () => this.onOkClick(companies, isResetSelectedCompanies),
      nzComponentParams: {inputData: componentData}
    });
  }

    onModalCancel(){
        this.modalRef.destroy();
    }

    onOkClick(companies, isResetSelectedCompanies?){
        this.loading = true;
        const records = companies.map(({ Gsid }) => ({ Gsid }));
        const body = { records };
        this.companiesFacade.deleteCompanies(body);
        if(isResetSelectedCompanies) {
            this.selectedCompanies = [];
        } else if(this.selectedCompanies.length){
            forEach(records, (record: any) => {
                const selectedCompanyIndex = this.selectedCompanies.findIndex(company => company.Gsid === record.Gsid);
                if(selectedCompanyIndex !== -1) {
                    this.selectedCompanies.splice(selectedCompanyIndex, 1);
                }
            });
        }
        this.modalRef.destroy();
    }

    deleteSelected(companies: any[], isResetSelectedCompanies?: boolean) {
    if (companies.length === 0) return;
    this.openModalDialog(companies.length, companies, isResetSelectedCompanies)
  }

  columnAction($event: any) {
    if (isEmpty($event.field)) return;
    switch ($event.field) {
      case 'action_column':
        this.openContextMenu($event.event, $event.data);
        break;
    }
    $event.event.preventDefault();
    $event.event.stopPropagation();
  }

    onGridChanges(event: any) {
    switch(event.payload && event.payload.action) {

      // gets called when next, previous and pagesize changes in grid
      case PaginatorAction.NEXT_PAGE:
      case PaginatorAction.PREVIOUS_PAGE: {
        this.additionalOptions.customPaginator.currentPageNum = event.payload.data;
        this.companyPayload.offset = (event.payload.data - 1) * this.companyPayload.limit;
        this.isPaginationAction = true;
        this.pageInfo.pageNumber = event.payload.data;
        break;
      }

      case PaginatorAction.PAGESIZE_CHANGE: {
        this.additionalOptions.customPaginator.currentPageNum = this.pageInfo.pageNumber = 1;
        this.additionalOptions.customPaginator.currentPageSize = this.pageInfo.pageSize = this.pageInfo.limit = event.payload.data;
        this.companyPayload.limit = event.payload.data;
        this.companyPayload.offset = 0;
        break;
      }
    }
    this.additionalOptions.customPaginator = setPaginatorOptions(this.additionalOptions.customPaginator, this.pageInfo);
    this.additionalOptions.customPaginator.fromRecord =  this.pageInfo.totalRecords ? (((this.pageInfo.pageNumber - 1) * this.pageInfo.pageSize) + 1) : 0;
    this.additionalOptions.customPaginator.toRecord =  (this.pageInfo.pageNumber * this.pageInfo.pageSize) > this.pageInfo.totalRecords ? this.pageInfo.totalRecords : (this.pageInfo.pageNumber * this.pageInfo.pageSize);
    this.additionalOptions.customPaginator.onDemand = true;
    this.additionalOptions.customPaginator.nextAvailable = this.pageInfo.nextAvailable;
  }

  handleOperations(info: {button: string}) {
    switch(info.button) {
      case DataOperationsConstants.CompanyListHeaderActions.ADD: {
        this.loading = true;
        this.saveListComponentInfo();
        this._router.navigate(['upsert']);
      }
      break;
      case DataOperationsConstants.CompanyListHeaderActions.DELETE: this.deleteSelected(this.selectedCompanies, true); break;
      case DataOperationsConstants.CompanyListHeaderActions.MERGE: this.mergeCompanies(); break;
    }
  }

  private mergeCompanies(evt?) {
    this.saveListComponentInfo();
    if (this.selectedCompanies.length === 2) {
      this._router.navigate([`merge/company`], { queryParams: { companyId1: this.selectedCompanies[0].Gsid, companyId2: this.selectedCompanies[1].Gsid, redirectUrl: '' } });
    } else {
      this._router.navigate([`merge/company`], { queryParams: { redirectUrl: ''} });
    }
  }

  onHeaderMenuItemSelected(selectedItem: {label: string}) {
    switch(selectedItem.label) {
      case DataOperationsConstants.CompanyListHeaderActionslabels.MERGE:
        this.mergeCompanies();
      break;
        case DataOperationsConstants.CompanyListHeaderActionslabels.REFRESH:
        this.gridAPI.setFilterModel({});
        this.gridAPI.refreshServerSideStore();
      break;
      case DataOperationsConstants.CompanyListHeaderActionslabels.MERGE_LOGS:
        const dialog = this._cfr.resolveComponentFactory<LogsComponent>(LogsComponent);
        this.mergeModalref = this.modalService.create({
          nzTitle: this.i18nService.translate('360.list_comp.mergeHistory'),
          nzWidth: 1000,
          nzContent: LogsComponent,
            nzFooter: [
                {
                    label: this.i18nService.translate('360.logs_comp.ok'),
                    type:'primary',
                    shape:'round',
                    onClick: () => this.onMergeLogsOk()
                }

            ],
          nzComponentParams: { data :{mergeId: null} }
        })
    }
  }

    onMergeLogsOk() {
        this.mergeModalref.destroy();
    }

    onFilterChanged(params): void {
        console.log('params', params);
    }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
