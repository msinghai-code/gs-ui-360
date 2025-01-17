import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FieldUtils, ReportFilterUtils, ReportUtils} from "@gs/report/utils";
import {ReportFilter} from "@gs/report/pojos";
import {AGGridEditMode, GRID_EVENTS, GSGridApi, PaginatorAction, setCustomCellRenderer} from "@gs/gdk/grid";
import {ReportFilterUtilsCore} from "@gs/cs360-lib/src/core-references";
import {StateAction} from '@gs/gdk/core';
import {RelationshipGridProcessor} from "./processors/RelationshipGridProcessor";
import {ACTION_COLUMN_DETAIL, CONTEXT_MENU_INFO} from "../../csm-relationship.constants";
import {assign, find, get, isEmpty, omit, sortBy, cloneDeep} from "lodash";
import {CsmRelationshipService} from "../../csm-relationship.service";
import {getInlineFilters} from "../../csm-relationship.utils";
import {
    CONTEXT_INFO,
    CS360Service,
    DataTypes,
    gridColumnMoved,
    gridColumnResized,
    ICONTEXT_INFO,
    isMini360,
    PageContext
} from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import {EnvironmentService} from "@gs/gdk/services/environment";
import {take} from "rxjs/operators";

@Component({
  selector: 'gs-relationship-list-view',
  templateUrl: './relationship-list-view.component.html',
  styleUrls: ['./relationship-list-view.component.scss']
})
export class RelationshipListViewComponent implements OnInit {

  @Input() configs: any;  //{ columns: [], baseObjectName: "", whereClause: {}  }

  @Input() options: any;

  @Output() action = new EventEmitter<StateAction>();

  public columnDefs;
  public data: any[] = [];
  public gridMode: AGGridEditMode = AGGridEditMode.NONE;
  public gridOptions: any= {};
  gridApi: any;
  public allColumns;
  public stateData;
  public isMini360: any;
  public gridAdditionalOptions = {
    customPaginator: {
        recordType: "rows",
        pageSizes: [10, 20, 30],
        pageSize: 10,
        pageIndex: 1,
        totalRecords: 10,
        fromRecord: 0,
        toRecord: 0,
        currentPageNum: 1,
        currentPageSize: 10,
        nextPageSize: 20,
        nextAvailable: true,
        onDemand: true,
        showPageChanger: true
    },
    serverSearch: true
  };
  private gridProcessor: any;
  public contextMenuInfo: any
  public filterData: any[];
  public showNoData = false;
  private persistentFilters: ReportFilter = ReportFilterUtils.emptyFilters();
  public disabledFields: string;
  public preservedColumns:any = [];

  constructor(private csmRelationshipService: CsmRelationshipService, @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
  private c360Service: CS360Service, private nzi18nService: NzI18nService, @Inject("envService") private _env: EnvironmentService) {
    this.gridProcessor = new RelationshipGridProcessor({ formatOptions: {}, meta: {
        sourceDetails: {
            connectionType: 'MDA'
        }
        } }, this.ctx, this.nzi18nService, this._env);
  }

  ngOnInit() {
    this.allColumns = this.configs.columns;
    this.createGridConfig();
    this.isMini360 = isMini360(this.ctx);
    this.contextMenuInfo = this.setAllowedContextMenuInfo();
    const { columns, whereClause } = this.configs;
    this.persistentFilters = whereClause;
    this.columnDefs = this.constructGridColumnDefs(columns);
    this.configs.columns = this.configs.columns.map(c => omit(c, ['axisDetails', 'dimensionDetails', 'properties']));
    this.gridProcessor.setFields(this.configs.columns);
    this.fetchListViewData();
  }

  createGridConfig() {
    this.gridOptions = {
        onGridReady: (params) => {
            this.gridApi = params.columnApi;
        },
      noRowsOverlayComponentParams: {
        title: this.nzi18nService.translate('360.csm.relationship_card.noData'),
        message: this.nzi18nService.translate('360.csm.company_hierarchy.no_records_message')
      },
      onCellClicked: (event: any) => {
        if(event.colDef.isNameColumn && this.ctx.isNativeWidget) {
          this.c360Service.set360ToRender({id: event.data[event.colDef.colId].k, pageContext: PageContext.R360});
        }
      },
      defaultColDef: this.gridProcessor.getDefaultColumnDef({}),
      getRowNodeId: (data): string => data.id,
      onSortChanged: this.onSortChanged.bind(this),
      autoResizeColumnsToFit: true,
      floatingFilter: true,
      deltaRowDataMode: true,
    }
      this.gridOptions.defaultColDef.floatingFilter =  true;
  }

    onSortChanged() {
      if(this.isMini360) {

          const colState = this.gridApi.getColumnState();
          // set display order for the columns, as per the columns in grid
          // update sort value of columns
          this.preservedColumns.forEach((col, i) => {
              let updatedIndex; // dispalyorder of the column in grid, as seen in UI.
              const matchedColumn = colState.find((c, index) => {
                updatedIndex = index;
                return c.colId === col.itemId;
              });

              col.colId = matchedColumn && matchedColumn.colId;
              col.sort =  matchedColumn && matchedColumn.sort;

              updatedIndex = matchedColumn ? updatedIndex : i; // if column is added to grid, use its index. or else use index from allcolumns

              if(updatedIndex > -1) {
                  col.displayOrder = updatedIndex;
              }
          });
          this.preservedColumns.sort((a, b) => a.displayOrder>b.displayOrder?1:-1);
          this.action.emit({type:'STATE_PRESERVE_COLS', payload: this.preservedColumns});
      }
    }

  fetchListViewData(showNoData = true) {
    this.emitEvent({type: "SHOW_LOADER", payload: true});
    const payload = this.constructPayload();
    this.csmRelationshipService
        .fetchRelationshipsListViewData(payload)
        .subscribe((list: any) => {
          this.emitEvent({type: "SHOW_LOADER", payload: false});
          if(!isEmpty(list)) {
            const data = list.data;

           // This has been done to support deltaRowData.
            this.filterData = data.map((rowData: any, index: number) => {
                this.configs && this.configs.allColumns && this.configs.allColumns.map(column => {
                    if(rowData[column.itemId] && rowData[column.itemId].fv === true || rowData[column.itemId] && rowData[column.itemId].v === true || rowData[column.itemId] && rowData[column.itemId].fv === 'true'){
                        rowData[column.itemId].fv = rowData[column.itemId].v = this.nzi18nService.translate('360.admin.boolean_options.true');
                    } else if(rowData[column.itemId] && rowData[column.itemId].fv === false || rowData[column.itemId] && rowData[column.itemId].v === false || rowData[column.itemId] && rowData[column.itemId].fv === 'false') {
                        rowData[column.itemId].fv = rowData[column.itemId].v = this.nzi18nService.translate('360.admin.boolean_options.false');
                    }
                })
              rowData.id = index + 1;
              return rowData;
            });
            if(showNoData) {
              this.showNoData = !this.filterData.length;
            }
            this.preparePaginationDescription(data.length, list.pageInfo);
          } else {
            this.filterData = [];
            this.showNoData = true;
          }
        });
  }

  updateColsInState(preservedColumns = []){
    const adminConfigFieldNames = this.allColumns.map(i => i.itemId);
    let isMismatched = false;

    // check for any deleted field in config and remove it from state preserved columns
    // Also, find if there is any deleted column, to update state preservation record
    preservedColumns =  preservedColumns.filter(v => {
      const index = adminConfigFieldNames.indexOf(v.itemId);
      if(index === -1){
        isMismatched = true;
      }
      return index !== -1;
    });

    // update state preservation, if there is a deleted/newly added field in it.
    if(isMismatched){
      this.emitEvent({type: 'STATE_PRESERVE_COLS', payload: preservedColumns});
    }

    return preservedColumns;
  }

  // /***
  //  * Construct Grid Column definitions
  //  * @param config
  //  */
  constructGridColumnDefs(config: any): any[] {
    config.forEach(element => {
      if(element.fieldName === "Name" && element.objectName === "relationship"){
        element.label = "Relationship Name";
      }
    });
      let columnDefs = this.gridProcessor.getColumns(config,{});
    //  if(isMini360(this.ctx)) {
          // this.allColumns = columnDefs;
          this.csmRelationshipService.stateData && this.csmRelationshipService.stateData.pipe(take(1)).subscribe(res => {
              this.stateData = res.state;
              const columnsState = this.stateData && this.stateData.columnsState;
               this.preservedColumns = (columnsState && columnsState[this.options.type.id]) || [];
              this.allColumns.forEach(col => {
                  const matchedItem = this.preservedColumns.find(col2 => col2 && col2.fieldName === col.fieldName);
                  if (matchedItem) {
                      col.width = matchedItem.properties && matchedItem.properties.width || 150;
                      matchedItem.width = col.width;
                  }
              })

              this.preservedColumns = this.updateColsInState(this.preservedColumns);
              const columnsToSort = this.preservedColumns.length > 0 ? this.preservedColumns : this.allColumns.map((c, i) => ({...c, displayOrder: i}))
              const displayOrderSortedColumns = sortBy(columnsToSort, 'displayOrder');
              columnDefs = this.gridProcessor.getColumns(displayOrderSortedColumns, {});
          })
  //    }
    const { actionsPermissionSet } = this.options;
    columnDefs.forEach(col => {
      col.minWidth = this.isMini360 ? 150: 200;
      if([DataTypes.DATE, DataTypes.DATETIME].includes(col.dataType)) {
        col.comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
          if(!valueA || !valueA.k) {
            valueA = { k: "" };
          } if(!valueB || !valueB.k) {
            valueB = { k: "" };
          }
          return valueA && valueB && valueA.k.localeCompare(valueB.k);
        }
      }
    })
    // Add action column to the grid
      columnDefs = (this.preservedColumns.length > 0  ? columnDefs.filter(col => !col.hidden).slice(0, this.preservedColumns.length): this.isMini360 ? columnDefs.filter(col => !col.hidden).slice(0, 4) : columnDefs);
      const actionCols = this.getActionColumnForMini(columnDefs);
    // Check for action permission set before adding the action column.
    // we need columndef for action column even when edit or delete is not present
    if(actionsPermissionSet.edit || actionsPermissionSet.delete || this._env.gsObject.userConfig.licenseType) {
      return [...columnDefs, ...actionCols];
    }

    return columnDefs;
  }

    getActionColumnForMini(selectedColumns) {
      ACTION_COLUMN_DETAIL.headerComponent = "gsColumnChooserRendererComponent";
      this.configs.columns.forEach(col => {
        col.field = col.itemId;
      });
      const allColumnsForRelType = (this.configs && this.configs.columns) ? this.configs.columns : [];
      allColumnsForRelType.forEach(col => { 
        if(col.label === "Relationship Name"){
          this.disabledFields = col.field;
        }
      });
      ACTION_COLUMN_DETAIL.headerComponentParams = {
          columns: allColumnsForRelType.filter(col => !col.hidden),
          disabledFields: [this.disabledFields],
          applyColumnSelection: (selectedColumns) => {
              this.onColumnUpdated(selectedColumns);
              selectedColumns.forEach(selectedColumn => {
                  // Find the column in allColumnsForRelType and delete its width
                  const column = this.columnDefs.find(col => col.field === selectedColumn);
                  if (isMini360(this.ctx) && column) {
                      // this.gridApi.autoSizeColumn(column.colId);
                      delete column.width;
                      delete column.properties.width;
                  }
              });
          },
          selectedColumns: selectedColumns,
          dataKey: "field",
          showSearch: true,
          maxSelectionAllowed: (isMini360(this.ctx) && allColumnsForRelType.length >= 4) ? 4 : allColumnsForRelType.length,
          showSelectAll: !isMini360(this.ctx),
      }

      return [ACTION_COLUMN_DETAIL]
          .map(col => {
            const cellRendererParams = {
              onClick: (action, payload) => {
                this.onContextMenuAction(action, payload);
              }
            }
            col.actionLabels = this.contextMenuInfo && this.contextMenuInfo.contextMenuItems.length > 0 ? this.contextMenuInfo.contextMenuItems : [];
            col.cellRendererParams = cellRendererParams;
              return col;
          });
  }

  onColumnUpdated(updatedColumns: any[]): void {
    // State preserve these columns.
        this.preservedColumns = [];

         // set display order for the columns
          this.allColumns.forEach((col, i) => {
            const index = updatedColumns.indexOf(col.field);
              if(index > -1) {
                this.preservedColumns.push(cloneDeep(col));
                  col.displayOrder = index;
              } else{
                col.displayOrder = i+1;
              }
          })
          this.allColumns.sort((a, b) => a.displayOrder>b.displayOrder?1:-1);

          const actionCols = this.getActionColumnForMini(this.allColumns);
          this.emitEvent({type: 'STATE_PRESERVE_COLS', payload: this.preservedColumns});
          // this is not sorting the date columns since in constructGridColumnDefs we are making use of comparator
          // this can be handled directly in the constructGridColumnDefs instead of here
          // this.columnDefs = [...this.gridProcessor.getColumns(updatedColsArr, {}),...actionCols];
          this.columnDefs = this.constructGridColumnDefs(this.allColumns);
  }

  // /***
  //  * Inline filter logic. They are not persistent filters.
  //  * @param filters
  //  */
  onFilter(filters: any) {
    const where: any[] = [];
    const parsedFilters: any[] = ReportUtils.parsedFilters(filters);
   parsedFilters.forEach((filterItem: any, index: number) => {
      const field = this.gridProcessor.getFields().find(f => f.itemId === filterItem.field);
      const alias = ReportFilterUtils.getFilterAlias(this.persistentFilters, index);
      where.push(getInlineFilters(field, filterItem.operator.toUpperCase(), alias, filterItem.value));
    });
    this.gridProcessor.setGridState({filters: {where}});
     const  updatedFilters = ReportFilterUtilsCore.addFilters({...this.persistentFilters}, where);
    // Set offset to 0 for inline search.
    this.gridAdditionalOptions.customPaginator = {
      ...this.gridAdditionalOptions.customPaginator,
      currentPageNum: 1
    }

    updatedFilters.conditions.forEach(filter => {
      assign(filter.leftOperand, get(filter, 'leftOperand.lookupDisplayField'));
    });
    
    this.configs.whereClause = updatedFilters;
    this.fetchListViewData(false);
  }

  onGridChanges(event): void {
    const eventType = event.type;
    if(eventType === 'PAGINATION'){
      switch(event.payload && event.payload.action) {
          case "PAGE_CHANGE":
          case PaginatorAction.PREVIOUS_PAGE:
              this.gridAdditionalOptions.customPaginator.currentPageNum = event.payload && event.payload.data;
              this.gridAdditionalOptions.customPaginator = {
                  ...this.gridAdditionalOptions.customPaginator,
                  currentPageNum: event.payload && event.payload.data
              }
              this.csmRelationshipService.getCustomPaginatorData({
                  ...this.gridAdditionalOptions.customPaginator,
                  currentPageNum: event.payload && event.payload.data
              });
              this.fetchListViewData();
              break;
          case PaginatorAction.PAGESIZE_CHANGE:
              this.gridAdditionalOptions.customPaginator = {
                  ...this.gridAdditionalOptions.customPaginator,
                  currentPageSize: event.payload && event.payload.data,
                  currentPageNum: 1
              }
              this.fetchListViewData();
              break;
      }
    } else if(eventType === GRID_EVENTS.FILTER) {
            this.onFilter(event.payload);
    }
      else if(eventType === "COLUMN_MOVED" ){
          if(isMini360(this.ctx)) {
              this.preservedColumns = gridColumnMoved(event, this.preservedColumns, 'Relationship Name', false);
              this.action.emit({type:'STATE_PRESERVE_COLS', payload: this.preservedColumns});
          }
      } else if (event.type === "COLUMN_RESIZE" && event.payload && event.payload.source === "uiColumnDragged") {
          if (isMini360(this.ctx)) {
              this.preservedColumns = gridColumnResized(event, this.preservedColumns, 'field');
              this.action.emit({type:'STATE_PRESERVE_COLS', payload: this.preservedColumns});
          }
      }
  }

  preparePaginationDescription(recordCount: number, pageInfo: any) {
    const currentPageSize: number = this.gridAdditionalOptions.customPaginator.currentPageSize;
    const currentPageNum: number = this.gridAdditionalOptions.customPaginator.currentPageNum;
    this.gridAdditionalOptions = {
      ...this.gridAdditionalOptions,
      customPaginator: {
        ...this.gridAdditionalOptions.customPaginator,
        totalRecords: pageInfo.recordCount,
        fromRecord: recordCount > 0 ? (currentPageNum - 1) * currentPageSize + 1: 0,
        toRecord: ((currentPageNum - 1) * currentPageSize) + recordCount,
        nextAvailable: pageInfo.nextAvailable
      }
    }
    this.csmRelationshipService.getCustomPaginatorData({
      ...this.gridAdditionalOptions.customPaginator,
    });
  }

  public onContextMenuAction(label: string, payload?: any) {
    this.action.emit({
      type: label,
      payload: payload
    });
  }

  public refresh(filters: ReportFilter) {
    this.persistentFilters = filters;
    this.configs.whereClause = this.persistentFilters;
    this.fetchListViewData();
  }

  private constructPayload() {
    const { currentPageSize, currentPageNum } = this.gridAdditionalOptions.customPaginator;
    const newColumns = this.configs.columns.concat([{
      dataType: "GSID",
      dbName: "gsid",
      fieldName: "Gsid",
      itemId: "rowIdentifierGSID",
      label: "GSID",
      objectName: "relationship"
    }, {
      dataType: "LOOKUP",
      fieldName: "TypeId",
      itemId: "rowIdentifierRelTypeGSID",
      label: "Type Id",
      objectName: "relationship"
    }]);
    return {
      ...this.configs,
      columns: newColumns,
      limit: currentPageSize,
      offset: (currentPageNum - 1) * currentPageSize
     };
  }

  private setAllowedContextMenuInfo(): any {
    const { actionsPermissionSet } = this.options;
    const { contextMenuItems } = CONTEXT_MENU_INFO;
    const newContextMenuItems = contextMenuItems.filter(c => actionsPermissionSet[c.id]);
    return {contextMenuItems: newContextMenuItems};
  }

  private emitEvent(evt: StateAction) {
    this.action.emit(evt);
  }

}
