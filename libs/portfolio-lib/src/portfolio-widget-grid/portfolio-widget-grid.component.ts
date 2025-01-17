import { fieldInfo2path } from "@gs/gdk/utils/field";
import { FieldTreeNode } from "@gs/gdk/core";
import { SfdcNavigator } from "@gs/gdk/utils/sfdc";
import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild
	} from '@angular/core';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { getSourceDetails, getPageName } from '../portfolio-widget-utils';
import {DataTypes, GridRequestSource, HealthScoreFields} from '../pojos/portfolio-enums';
import map from "lodash/map";
import sortBy from "lodash/sortBy";
import max from "lodash/max";
import { PortfolioCellEditorComponent } from './portfolio-cell-editor/portfolio-cell-editor.component';
import { PortfolioCellRendererComponent } from './portfolio-cell-renderer/portfolio-cell-renderer.component';
import { PortfolioWidgetGSField } from './PortfolioWidgetGSField';
import { PortfolioWidgetService } from './portfolio-widget.service';
import {
	PortfolioGridActionInfo,
	PortfolioGridInfo,
	PortfolioGSField,
	ReportMaster
} from '../pojos/portfolio-interfaces';
import { PORTFOLIO_WIDGET_CONSTANTS, PORTFOLIO_GRID_ACTIONS } from '../pojos/portfolio.constants';
import { HealthScoreRendererComponent } from './health-score-renderer/health-score-renderer.component';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import escape from "lodash/escape";
import { DescribeService } from "@gs/gdk/services/describe";
import {GridVisualizerComponent} from "./grid-visualizer/grid-visualizer.component";
import {GridApi} from "@ag-grid-community/core";
import {IAGGridColumn, IAGGridConfig} from "../pojos/gs-grid.interface";
import {PortfolioGridProcessor} from "./pre-preocessor";
import {FilterUtils} from "../utils/FilterUtils";
import {GridUtils} from "../utils/GridUtils";
import {CustomTooltip} from "./customtooltip";
import {IPaginatorAction} from "../pojos/paginator.interface";
import {NameRendererComponent} from "./name-rendering-component";

export const DEFAULT_REPORT_VIEWER = {
	data: null,
	config: {
		options: {},
		mode: 'NONE',
		wrapText: false
	} as any,
	displayType: '',
	visualization: {
		list: [],
		selectedType: null,
		show: false
	},
	pageInfo: null,
	loading: false,
	loaderOptions: {
		loaderType: 'SVG',
		loaderParams: {
			svg_url_class: ''
		}
	},
	autoRunButton: {
		show: false,
		disabled: false
	},
	showReport: false,
	hasError: null,
	info: null
};

@Component({
    selector: 'gs-portfolio-widget-grid',
    templateUrl: './portfolio-widget-grid.component.html',
    styleUrls: ['./portfolio-widget-grid.component.scss']
})

export class PortfolioWidgetGridComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild("gridVisualizer", { static: false }) gridVisualizer: GridVisualizerComponent;

    @Input() gridInfo: PortfolioGridInfo;
    @Input() objectName: string;
    @Input() requestSource: string;
	@Input() isNotLiveWidget: boolean;

    @Output() action = new EventEmitter<PortfolioGridActionInfo>();

    showGrid = false;

    private responseData: any;
    private reload = false;
    private gridPreProcessor: PortfolioGridProcessor;
    private reportMaster: ReportMaster;
	private gridApi: GridApi;
	private isInlineEditEnabled = false;
	private hasHealthScoreColumn = false;
    reportViewer = {
        ...DEFAULT_REPORT_VIEWER,
        config: {
          options: {},
          mode: 'NONE',
          wrapText: false,
          additionalOptions: <any>{}
        },
        reportOptions: [],
        autoRunButton: {
          text: 'Run Report',
          show: false,
          disabled: false
        },
        loaderOptions: PORTFOLIO_WIDGET_CONSTANTS.LOADER_OPTIONS,
        appendData: false
    };

    constructor(@Inject("envService") public env: EnvironmentService,
    private cdr: ChangeDetectorRef,
	// private iconService: NzIconService,
    private portfolioWidgetService: PortfolioWidgetService,
    public i18nService: NzI18nService,
	private _ds: DescribeService) {
		// this.iconService.changeAssetsSource(this.env.getGS().cdnPath);
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
			if(this.objectName){
				this._ds.getObjectTree(
					{ id: 'MDA', name: 'MDA', type: 'MDA',  apiContext:"api/reporting/describe"},
					this.objectName,
					1,
					null, {skipFilter: true}
					).then(response=>{
						if(response && response.children && changes.gridInfo) {
							this.reportViewer.loading = true;
							if(this.gridInfo.data && this.gridInfo.data.error) {
								this.reportViewer.loading = false;
								this.responseData = {};
								this.cdr.detectChanges();
							} else if(this.gridInfo.data) {
								this.reportMaster = {...this.gridInfo.reportMaster};
								this.responseData = {...this.gridInfo.data};
								this.reload = this.gridInfo.triggerReload;
								this.isInlineEditEnabled = this.requestSource === GridRequestSource.INLINEEDIT || this.requestSource === GridRequestSource.BULKEDIT;
								this.processData(response.children);
								this.cdr.detectChanges();
							}
						}
					})
			}
    }

    getGridData(data: Array<any>) {
		return data.map((rowData: any, index: number) => {
		rowData.id = index + 1;
		return rowData;
		});
    }

    resizeToParentDimensions() {
      	if (this.gridVisualizer) { this.gridVisualizer.resizeGridDimensions(); }
	}
	
	deselectRows() {
		this.gridApi.deselectAll();
	}

    async processData(describeData: FieldTreeNode[]) {
        if(this.requestSource === GridRequestSource.BULKEDIT && this.gridApi) {
			this.deselectRows();
		}
        if (!this.gridPreProcessor || this.reload) {
			const moduleConfig = {
				pageSizes: PORTFOLIO_WIDGET_CONSTANTS.GRID_PAGE_SIZES,
				FEATURE_ENABLEMENT: {},
				GRID: {
					pageSizes: PORTFOLIO_WIDGET_CONSTANTS.GRID_PAGE_SIZES
				}
			} as any;
			this.gridPreProcessor = new PortfolioGridProcessor({
			  data: this.responseData.data,
			  columns: <PortfolioGSField[]>sortBy(this.reportMaster.showFields, ['displayOrder']),
			  meta: {
				  configuration: moduleConfig,
				  sourceDetails: getSourceDetails(this.objectName),
				  orderFields: GridUtils.getSortOrder(this.reportMaster.orderByFields,
					<any[]>this.reportMaster.showFields,
					moduleConfig, 
					getSourceDetails(this.objectName)),
				  userConfig: this.env.user
			  },
			  gridState: {filters: {}, order: this.reportMaster.orderByFields},
				formatOptions: {
				  currency: {
					  symbol: (window as any).GS.gsCurrencyConfig.currencyIsoCode
				  }
				}
			}, this.i18nService);
			this.setReportViewer(describeData);
			this.showGrid = true;
			this.reportViewer.loading = false;
			if(!this.reportViewer.config.additionalOptions.customPaginator.fromRecord) {
				this.reportViewer.config.additionalOptions.customPaginator.fromRecord = 1;
				this.reportViewer.config.additionalOptions.customPaginator.toRecord = this.reportViewer.config.additionalOptions.customPaginator.currentPageSize;
			}
			this.cdr.detectChanges();
        } else {
			this.reportViewer.data = this.getGridData(this.responseData.data);
			this.reportViewer.pageInfo = {...this.reportViewer.pageInfo, ...this.responseData.pageInfo};
			this.reportViewer.config.additionalOptions = {
				...this.reportViewer.config.additionalOptions, 
				noRowsOverlayComponentParams: this.gridInfo.noRowsOverlayComponentParams
			};
			this.getTotalRecordCount();
			this.reportViewer.loading = false;
			this.cdr.detectChanges();
		}
	}

	private setReportViewer(describeData: FieldTreeNode[]) {
		const gridState = this.portfolioWidgetService.getInitialReportingGridState(this.objectName);
		this.reportViewer.data = this.getGridData(this.responseData.data);
		this.reportViewer.pageInfo = {...this.reportViewer.pageInfo, ...this.responseData.pageInfo};
		this.reportViewer.displayType = 'GRID';
		this.reportViewer.visualization = {
			...this.reportViewer.visualization,
			selectedType: this.reportViewer.displayType.toLowerCase()
		};
		this.getTotalRecordCount();
		this.reportViewer.config = this.createGridConfig(this.reportMaster.showFields, gridState, {...this.responseData});
		this.reportViewer.config.options = this.setCustomProperties(this.reportViewer.config.options, describeData);
		if(this.requestSource === GridRequestSource.BULKEDIT) {
			this.addBulkEditPropertiesToOptions(this.reportViewer.config.options);
		}
		this.reportViewer = {
			...this.reportViewer,
			showReport: true,
			hasError: null,
			info: GridUtils.getReportInfo(gridState),
			config: {
				...this.reportViewer.config, 
				additionalOptions: {
					...this.reportViewer.config.additionalOptions, 
					noRowsOverlayComponentParams: this.gridInfo.noRowsOverlayComponentParams
				}
			}
		};
	}

	public createGridConfig(fields, state, additionalOptions): any {
		const gridOptions = {
			freezeFirstColumn: true,
			textWrap: false
		};
		const gridProps: any = {filterable: true};
		const columns = this.gridPreProcessor.getColumns(fields, {...gridOptions, ...gridProps});
		return {
			options: {
				columnDefs: columns,
				resizable: true, // column resizing
				columnMenu: false,
				height: 600,
				rowHeight: 48,
				showCommandColumn: false,
				groupable: false,// to enable Drag n drop
				multiColumnHeader: false,
				defaultColDef: {
					suppressMenu: true,
					resizable: true,
					filter: true,
					sortable: true,
					sortingOrder: ['asc', 'desc'],
					floatingFilter: true
				},
				pagination: false,
				deltaRowDataMode: true,
				autoResizeColumnsToFit: true,
				noRowsOverlayComponentParams: {
					title: this.i18nService.translate('360.core.grid.nodata'),
					message: this.i18nService.translate('360.csm.inline_edit.changeFilters')
				},
				additionalProps: {
					lockPinned: true
				}
			},
			mode: "NONE",
			additionalOptions: {
				showCustomPagination: true,
				customPaginator: {
					customMessage: additionalOptions.paginatorConfig && additionalOptions.paginatorConfig.customMessage,
					currentPageNum: 1,
					currentPageSize: state.pageSize,
					pageSizes: [25, 50],
					totalRecords: this.getTotalRecordCount(),
					recordType: '',
					nextAvailable: additionalOptions.pageInfo.nextAvailable,
					// descriptionText: this.i18nService.translate('360.admin.custom_paginator.totalRecords'),
					onDemand: true,
					recordCount: additionalOptions.data.length
				},
				noDataMessage: '',
				serverSort: true,
				serverSearch: true,
			}
		};
	}

	private setPaginatorOptions() {
		if (!this.reportViewer.config.additionalOptions.customPaginator) {
			this.reportViewer.config.additionalOptions.customPaginator = {};
		}
		const currentPageNum = this.reportMaster.offset === 0 ? 1 : this.reportViewer.config.additionalOptions.customPaginator.currentPageNum;
		const currentPageSize = this.reportViewer.config.additionalOptions.customPaginator.currentPageSize;
		this.reportViewer.config.additionalOptions.customPaginator = {
			...this.reportViewer.config.additionalOptions.customPaginator,
			...this.gridPreProcessor.setPaginatorScale({
				currentPageNum,
				currentPageSize,
				recordCount: this.reportViewer.data.length
			}),
			nextAvailable: this.reportViewer.pageInfo.nextAvailable,
            showPageChanger: true
		};
		this.reportViewer.config = {
			...this.reportViewer.config,
			additionalOptions: {
				...this.reportViewer.config.additionalOptions,
				customPaginator: {
					...this.reportViewer.config.additionalOptions.customPaginator,
					totalRecords: this.reportViewer.pageInfo ? this.reportViewer.pageInfo.recordCount : 0
				}
			}
		};
	}

    private getSelectionColumn() {
		return {
			field: "select-all", // do not change colId, using in CSS to identify this column for styles
			pinned: "left",
            lockPosition: true,
			sortable: false,
			headerName: "",
			headerCheckboxSelection: true,
			checkboxSelection: true,
			stopRowSelection: false,
			minWidth: 45,
			width: 45,
			maxWidth : 50
		};
    }

    private addBulkEditPropertiesToOptions(options: IAGGridConfig) {
		options.columnDefs.unshift(this.getSelectionColumn());
		options.rowSelection = "multiple";
		options.rowMultiSelectWithClick = false;
		options.suppressRowClickSelection = true;
		options.onSelectionChanged = params => {
			this.action.emit({
				action: PORTFOLIO_GRID_ACTIONS.ROW_SELECTION_CHANGED,
				info: params.api.getSelectedNodes()
			});
		}
    }

	private getRowHeight(params) {
		let rowHeight = params.node.rowHeight;
		if(this.hasHealthScoreColumn) {
			return 54;
		}
		if(params.node.rowPinned){
		  const colCalculationsLength = max(
			Object.values(params.node.data).map(item => Object.keys(item).length));
		  rowHeight = colCalculationsLength * 30;
		}
		return rowHeight;
	}

    private setCustomProperties(gridOptions: IAGGridConfig, describeData: FieldTreeNode[]) {
        gridOptions.lockPinned = true;
		gridOptions.columnDefs = this.getModifiedColumnDefs({...gridOptions.columnDefs}, describeData);
		gridOptions.animateRows = false;
		gridOptions.getRowHeight = this.getRowHeight.bind(this);
		gridOptions.suppressRowClickSelection = true;
		gridOptions.rowMultiSelectWithClick = false;
		gridOptions.suppressAnimationFrame = true;
		gridOptions.onCellEditingStopped = (params) => {
			if(params.value.inlineEditData) {
				this.action.emit({action: PORTFOLIO_GRID_ACTIONS.CELL_EDIT, info: params});
			} else {
				if(params.value.isInvalid) {
					this.action.emit({action: PORTFOLIO_GRID_ACTIONS.CELL_EDIT_INVALID, info: null});
				}
				params.node.setData(params.data);
			}
		}
		gridOptions.singleClickEdit = this.isInlineEditEnabled;
		return gridOptions;
	}

	private getIsCompanyOrRelationshipName(field: PortfolioWidgetGSField) {
		return ["company", "relationship"].includes(field.objectName) && field.fieldName === "Name";
	}

		public checkIfMappingField(fieldMeta, describeData: FieldTreeNode[]){
            const path = fieldInfo2path({leftOperand:fieldMeta}, describeData);
			if(path) {
				const describeField = path && path[path.length - 1] && path[path.length - 1].data;
				if(describeField && describeField.meta && describeField.meta.mappings){
					fieldMeta.mappings = describeField.meta.mappings;
				}
				return fieldMeta;
			}
		}
			
	getModifiedColumnDefs(columnDefs: IAGGridColumn[], describeData: FieldTreeNode[]) {
		return map(columnDefs, (columnDef: IAGGridColumn) => {
            if(columnDef.field == 'company_Name' || columnDef.field ==  "relationship_Name"){
                columnDef.lockPosition = true;
                columnDef.pinned = 'left';
				columnDef.sort = 'asc';
            }
			if(columnDef.dataType) {
				if(columnDef.floatingFilterComponentParams) {
					columnDef.floatingFilterComponentParams.placeholder = '';
				}
				const fieldMeta: PortfolioWidgetGSField = this.reportMaster.showFields.find(f => f.fieldAlias === columnDef.field) as PortfolioWidgetGSField;
				const fieldMetaMapping = this.checkIfMappingField(fieldMeta, describeData)
				columnDef.hide = fieldMeta.hidden;
				columnDef.stopRowSelection = true;
				if(fieldMetaMapping && fieldMetaMapping.mappings){
					columnDef.mappings = fieldMetaMapping.mappings;
				}
				columnDef.tooltipValueGetter = this.getTooltipValueGetter();
				delete columnDef.cellRendererSelector;
				delete columnDef.cellRenderer;
				if(this.requestSource === 'BULKEDIT'){
					// BULKEDIT is consumption and ADMINCONFIG is admin page
					columnDef.tooltipComponent = CustomTooltip;
					columnDef.cellClassRules = {
						'non-editable-cell': (params) => params.colDef.editable !== true,
					};
				}
				let cellRenderer: any = {
					'cellRenderer': (params) => {
						let value;
						let cssClass;
						if(params.colDef.dataType === DataTypes.URL && !params.colDef.editable) {
							value = this.customURLCellRenderer(params.colDef, params);
						} else {
							if(params.value && params.value.inlineEditData) {
								cssClass = 'ag-cell-null-color px-portfolio-edit';
								value = params.value.inlineEditData.fv;
							} else {
								value = params.valueFormatted === "NULL" ? '---' : params.valueFormatted;
							}
							if(params.colDef.editable) {
								cssClass += (params.colDef.dataType === DataTypes.URL || this.getIsCompanyOrRelationshipName(fieldMeta)) && value !== "---" ?  ' url-cell grid-cell-hover-highlight' : ' grid-cell-hover-highlight';
							}
						} 
						const html = params.valueFormatted === "NULL" ? '---' : params.valueFormatted;
						const doc = new DOMParser().parseFromString(html, 'text/html');
						const anchorElement = doc.querySelector('a');
						if (anchorElement) {
							anchorElement.setAttribute('target', '_blank');
							var modifiedValue = new XMLSerializer().serializeToString(doc);
						} else {
							modifiedValue = value;
						}
						// if(!linkValue){
						// 	return columnDef.mappings ? '<span class="'+ cssClass + '">' + escape(value) + '</span>' : '<span class="'+ cssClass + '">' + modifiedValue + '</span>'
						// }
						return columnDef.mappings ? '<span class="'+ cssClass + '">' + escape(value) + '</span>' : '<span class="'+ cssClass + '">' + modifiedValue + '</span>'
					}
				};
				let scoreTypeList: string[] = [HealthScoreFields.COMPANY_HEALTHSCORE, HealthScoreFields.RELATIONSHIP_HEALTHSCORE, HealthScoreFields.COMPANY_PREVIOUS_HEALTHSCORE, HealthScoreFields.RELATIONSHIP_PREVIOUS_HEALTHSCORE];
                if(scoreTypeList.includes(columnDef.field)) {
					this.hasHealthScoreColumn = true;
                    cellRenderer = {cellRendererFramework: HealthScoreRendererComponent};
					delete columnDef.floatingFilterComponentFramework;
					delete columnDef.filter;
					columnDef.floatingFilter = false;
					columnDef.filter = false;
					delete columnDef.tooltipValueGetter;
					columnDef.enableTooltip = false;
                }
				if(this.isInlineEditEnabled && fieldMeta.editable) {
					columnDef.editable = true;
					delete columnDef.cellEditor;
					if(fieldMeta.dependentPicklistInfo) {
						this.portfolioWidgetService.fetchDependencyItemMappings(fieldMeta.dependentPicklistInfo);
					}
					const cellEditor =  {cellEditorFramework: PortfolioCellEditorComponent, cellEditorParams: {field: fieldMeta, objectName: this.objectName}};
					if(fieldMeta.dataType.toUpperCase() === DataTypes.BOOLEAN || fieldMeta.dataType.toUpperCase() === DataTypes.PICKLIST) {
						cellRenderer = {cellRendererFramework: PortfolioCellRendererComponent, cellRendererParams: {field: fieldMeta, isInlineEditGrid: this.isInlineEditEnabled}};
					}
                    columnDef = {...columnDef, ...cellEditor, ...cellRenderer};
				} else {
					columnDef = {...columnDef, ...cellRenderer};
					if(columnDef.field === 'company_Name' || columnDef.field ==  "relationship_Name" || this.getIsCompanyOrRelationshipName(fieldMeta)){
						columnDef.cellRenderer = NameRendererComponent;
						columnDef.cellRendererParams = (params ) => {
							return  {
								params,
								originalColumn: fieldMeta
							};
						}
					}
				}
			}
			return columnDef;
		});
	}

	protected getTooltipValueGetter() {
		return (params) => {
			const value = params.value && params.value.fv ? params.value.fv : '';
			if ((params.colDef && params.colDef.editable === false) && (this.requestSource === 'BULKEDIT')) {
				return value
					? `<b>${value}</b><br/><br/><span>Editing this field requires additional permissions. Please reach out to your Gainsight Administrator to request access.</span>`
					: `<span>Editing this field requires additional permissions. Please reach out to your Gainsight Administrator to request access.</span>`;
			}
			return value;
		};
	}

	public getScoreTooltip(params: any){
		if(!params.value.fv) {
			return null;
		}
		const fact = {
			curScore: params.value.properties.score,
			curScoreColor: params.value.properties.color,
			curScoreLabel: params.value.properties.label,
			trend: params.value.properties.trend,
			label: params.value.properties.label
		};
		let score:any = fact.curScore;
		let label = fact.curScoreLabel;
		score = score === undefined ? "NA" : score;
		label = label === undefined ? "NA" : label;
		let text;
		if((typeof score === 'string')&&(!Boolean(score))){
		  score = "NA";
		}
		if(params.value.properties.schemeType === "NUMERIC"){
		  // only label as tooltip becoz scores are already part of measure circle
		  text = `Label:${fact.curScoreLabel || "NA"}`;
		}else if(  params.value.properties.schemeType === "COLOR"){
		  // label and scores as tooltip becoz measure circle will have only color
		  text = `Label:${label}, Score:${score}`;
		}else if( params.value.properties.schemeType === "GRADE"){
		  // only score as tooltip becoz labels already part of circle
		  text = `Score:${score}`;
		}
		return text;
	}

    /*
        This function gives the total number of records available
     */
    getTotalRecordCount() {
		this.setPaginatorOptions();
    }

    onGridAction(event: any) {
        switch (event.action) {
            case PORTFOLIO_GRID_ACTIONS.GRID_READY:
                this.gridApi = event.payload.api;
                this.getTotalRecordCount();
                this.action.emit({action: PORTFOLIO_GRID_ACTIONS.GRID_READY});
                break;
            case PORTFOLIO_GRID_ACTIONS.PREVIOUS_PAGE:
            case PORTFOLIO_GRID_ACTIONS.NEXT_PAGE:
                this.reportViewer.loading = true;
                this.reportViewer.config.additionalOptions.customPaginator.currentPageNum = event.data;
                const offset: number = (event.data - 1) * this.reportViewer.config.additionalOptions.customPaginator.currentPageSize;
                this.reportMaster.offset = offset;
                this.action.emit({action: PORTFOLIO_GRID_ACTIONS.PREVIOUS_PAGE, info: this.reportMaster.offset});
                break;
            case PORTFOLIO_GRID_ACTIONS.SEARCH:
                this.reportViewer.loading = true;
                this.performServerSearch(event.data);
                this.reportMaster.whereFilters = FilterUtils.addFilters({} as any, this.gridPreProcessor.getGridState().filters.where || []) || {};
                this.action.emit({action: PORTFOLIO_GRID_ACTIONS.SEARCH, info: this.reportMaster.whereFilters.conditions || []});
                this.getTotalRecordCount();
                break;
            case PORTFOLIO_GRID_ACTIONS.SORT:
                this.reportViewer.loading = true;
                this.performServerSort(event.data);
                this.reportMaster.orderByFields = this.gridPreProcessor.getGridState().order || this.reportMaster.orderByFields;
				const infoForPayload = this.reportMaster.orderByFields[0];
				if(infoForPayload.dataType === "picklist"){
					infoForPayload.fieldAlias += "_PicklistLabel";
				}
				this.action.emit({action: PORTFOLIO_GRID_ACTIONS.SORT, info: [infoForPayload]});
                break; 
            case PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE:
                this.reportViewer.loading = true;
                this.onPageSizeChange(event);
                this.action.emit({action: PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE, info: this.reportMaster.pageSize || event});
                break;
						case IPaginatorAction.PAGE_CHANGE:
							this.reportViewer.loading = true;
							this.reportViewer.config.additionalOptions.customPaginator.currentPageNum = event.data;
							const offsetValue: number = (event.data - 1) * this.reportViewer.config.additionalOptions.customPaginator.currentPageSize;
							this.reportMaster.offset = offsetValue;
							this.action.emit({action: PORTFOLIO_GRID_ACTIONS.PREVIOUS_PAGE, info: this.reportMaster.offset});
							break;
			case PORTFOLIO_GRID_ACTIONS.COLUMN_MOVED:
				this.action.emit({action: PORTFOLIO_GRID_ACTIONS.COLUMN_MOVED, info: event.data});
				break;
		}
    }

    protected onPageSizeChange(event: any): void {
      const currentPageSize: number = event.data;
	  // NOTE: commenting as ng core function is always returning true without any logic inside it
      // if(ReportValidationUtils.limitShouldBeLessThanOrEqualToPageSize(this.reportMaster.limit || 0, currentPageSize)) {
        this.reportViewer.config.additionalOptions.customPaginator.currentPageNum = 1;
        this.reportViewer.config.additionalOptions.customPaginator.currentPageSize = currentPageSize;
        this.reportMaster.offset = 0;
        this.reportMaster.pageSize = currentPageSize;
      // }
    }

    protected performServerSearch(filters: any) {
      const where: any[] = [], having: any[] = [];
      const parsedFilters: any[] = GridUtils.parsedFilters(filters);
      this.reportMaster.offset = 0;
      this.reportViewer.config.additionalOptions.customPaginator.currentPageNum = 1;
      parsedFilters.forEach((filterItem: any, index: number) => {
        const filterField: any = this.gridPreProcessor.getReportGSFilterField(filterItem);
        const alias = FilterUtils.getFilterAlias({}, index);
        where.push(FilterUtils.getWhereFilters(filterField, filterItem.operator.toUpperCase(), alias, filterItem.value));
      });
      this.gridPreProcessor.setGridState({filters: {where, having}});
    }

    protected performServerSort(sortParams: any) {
      const sortOrder = this.gridPreProcessor.getOrderByFields(sortParams);
      this.gridPreProcessor.setGridState({order: sortOrder});
	}
	
	private customURLCellRenderer(column: PortfolioGSField, params: any) {
		/**
		 * value undefined case occurs when column calculations is applied on some field
		 * url will never have column calculations to display
		 */
		if(!params.value) {
		  return "";
		}
		let url: string = params.value.fv || "";
		let prefixedUrl: string = url;
		// Fallback for urls if they dont have http/https verbs prefixed.
		// restricting the same for row grouping top level aggregations
		/**
		 * params.value.field is populated for the first level rows
		 * need to check if there is a better way to identify if the cell renderer
		 * is called for top level rows or inner rows
		 */
		if (!params.value.field) {
		  if (!!url && !url.match(/^[a-zA-Z]+:\/\//)) {
			prefixedUrl = `https://${url}`;
		  }
		  url = !!url ? `<a href="${prefixedUrl}" target="_blank">${url}</a>` : '';
		}
		return url;
	}

    ngOnDestroy() {
    }

}
