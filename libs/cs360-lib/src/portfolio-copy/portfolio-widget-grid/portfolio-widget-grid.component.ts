import {
    DEFAULT_REPORT_VIEWER,
    GRID_GROUP_TYPE
} from '@gs/report/constants';
import {BuilderGridProcessorFactory} from '@gs/report/report-viewer';
import {ReportMaster} from "@gs/report/pojos";

import {ReportUtils, ReportFilterUtils, ReportValidationUtils, ReportGSField} from "@gs/report/utils";
import { fieldInfo2path } from "@gs/gdk/utils/field";
import {
    FieldTreeNode } from "@gs/gdk/core";
import {AGGridColumn, AGGridApi, AGBaseGridConfig} from '@gs/gdk/grid';
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
// import { GridVisualizerComponent } from '@gs/core/src/shared/src/lib/report-viewer/grid-visualizer/grid-visualizer.component';
import { GridVisualizerComponent } from '@gs/report/report-viewer';
// import { GridVisualizerComponent } from '@gs/cs360-lib/src/core-references';
import { map, sortBy, max } from 'lodash';
import { PortfolioCellEditorComponent } from './portfolio-cell-editor/portfolio-cell-editor.component';
import { PortfolioCellRendererComponent } from './portfolio-cell-renderer/portfolio-cell-renderer.component';
import { PortfolioWidgetGSField } from './PortfolioWidgetGSField';
import { PortfolioWidgetService } from './portfolio-widget.service';
import { PortfolioGridActionInfo, PortfolioGridInfo } from '../pojos/portfolio-interfaces';
import { PORTFOLIO_WIDGET_CONSTANTS, PORTFOLIO_GRID_ACTIONS } from '../pojos/portfolio.constants';
import { HealthScoreRendererComponent } from './health-score-renderer/health-score-renderer.component';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzIconService } from '@gs/ng-horizon/icon';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { escape } from "lodash";
import { DescribeService } from "@gs/gdk/services/describe";
import { ReportFilterUtilsCore } from '@gs/cs360-lib/src/core-references';

//TODO: need to add lockPinned in @gs/gdk and remove this
interface AGGridConfig extends AGBaseGridConfig {
	editType?: string;
	multiColumnHeader?: boolean;
	rowSelection?: string;
	autoResizeColumnsToFit?: boolean;
	recordType?: string; // for showing item label while moving items to folders
	sort?: any[];
	lockPinned? :boolean;
  }

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
    totalRecordsCount = 0;

    private responseData: any;
    private reload = false;
    private gridPreProcessor: any;
    private reportMaster: ReportMaster;
	private gridApi: AGGridApi;
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
			const processor = await BuilderGridProcessorFactory.getGridInstance(GRID_GROUP_TYPE.DEFAULT);
			const moduleConfig = {
				pageSizes: PORTFOLIO_WIDGET_CONSTANTS.GRID_PAGE_SIZES,
				FEATURE_ENABLEMENT: {},
				GRID: {
					pageSizes: PORTFOLIO_WIDGET_CONSTANTS.GRID_PAGE_SIZES
				}
			} as any;
			this.gridPreProcessor = new processor({
			  data: this.responseData.data,
			  columns: <ReportGSField[]>sortBy(this.reportMaster.showFields, ['displayOrder']),
			  meta: {
				  configuration: moduleConfig,
				  sourceDetails: getSourceDetails(this.objectName),
				  orderFields: ReportUtils.getSortOrder(this.reportMaster.orderByFields, 
					<ReportGSField[]>this.reportMaster.showFields, 
					moduleConfig, 
					getSourceDetails(this.objectName)),
				  userConfig: this.env.user
			  },
			  gridState: {filters: {}, order: this.reportMaster.orderByFields}
			}); // removed i18nservice
			this.setReportViewer(describeData);
			this.showGrid = true;
			this.reportViewer.loading = false;
			this.cdr.detectChanges();
        } else {
			this.reportViewer.data = this.getGridData(this.responseData.data);
			this.reportViewer.pageInfo = {...this.reportViewer.pageInfo, ...this.responseData.pageInfo};
			this.reportViewer.config.additionalOptions = {
				...this.reportViewer.config.additionalOptions, 
				noRowsOverlayComponentParams: this.gridInfo.noRowsOverlayComponentParams
			};
			this.getTotalRecordCount();
			this.setPaginatorOptions();
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
		this.reportViewer.config = this.gridPreProcessor.createGridConfig(<ReportGSField[]>this.reportMaster.showFields, gridState, {...this.responseData}) as any;
		this.reportViewer.config.options = this.setCustomProperties(this.reportViewer.config.options, describeData);
		if(this.requestSource === GridRequestSource.BULKEDIT) {
			this.addBulkEditPropertiesToOptions(this.reportViewer.config.options);
		}
		this.reportViewer = {
			...this.reportViewer,
			showReport: true,
			hasError: null,
			info: ReportUtils.getReportInfo(gridState),
			config: {
				...this.reportViewer.config, 
				additionalOptions: {
					...this.reportViewer.config.additionalOptions, 
					noRowsOverlayComponentParams: this.gridInfo.noRowsOverlayComponentParams
				}
			}
		};
	}
	
	private setPaginatorOptions() {
		const currentPageNum = this.reportMaster.offset === 0 ? 1 : this.reportViewer.config.additionalOptions.customPaginator.currentPageNum;
		const currentPageSize = this.reportViewer.config.additionalOptions.customPaginator.currentPageSize;
		this.reportViewer.config.additionalOptions.customPaginator = {
		...this.reportViewer.config.additionalOptions.customPaginator,
		...this.gridPreProcessor.setPaginatorScale({
			currentPageNum,
			currentPageSize,
			recordCount: this.reportViewer.data.length
		}),
		nextAvailable: this.reportViewer.pageInfo.nextAvailable
		};
		this.reportViewer.config = {
		...this.reportViewer.config,
		additionalOptions: {
			...this.reportViewer.config.additionalOptions
		}
		};
	}

    private getSelectionColumn() {
		return {
			field: "Select",
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

    private addBulkEditPropertiesToOptions(options: AGGridConfig) {
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

    private setCustomProperties(gridOptions: AGGridConfig, describeData: FieldTreeNode[]) {
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

	private getLinkValue(params: any, objectName: string) {
		const isSFDCHybrid = HybridHelper.isSFDCHybridHost();
		const id = params.data && params.data[params.colDef.colId] && params.data[params.colDef.colId].k;
		if(!id) {
			return null;
		}
		let url;
		let segmenturl = "";
		let pageName;
		const instance: any = this.env.instanceDetails;
		if(objectName === "company") {
			segmenturl = "?cid=" + id;
			pageName = getPageName(
				this.env,
				"CUSTOMERSUCCESS360",
				instance && instance.packageNS,
				true
			);
		} else if(objectName === "relationship") {
			segmenturl = "?rid=" + id;
			pageName = getPageName(
				this.env,
				"RELATIONSHIP360",
				instance && instance.packageNS,
				true
			);
		}
		const sfdcNavigator = new SfdcNavigator(this.env);
		url = this.generateNewTabUrl(segmenturl, pageName, sfdcNavigator, HybridHelper, true); 
		return url;
	}

	generateNewTabUrl(url, pageName, sfdcHelper, hybridHelper, includePageName?:boolean) {
		const isSFDCLighting = sfdcHelper.isLightning();
		const isSFDC = sfdcHelper.isSFDC();
		const isSFDCHybrid = hybridHelper.isSFDCHybridHost()
		let pageURL = pageName + url;
		if(isSFDCHybrid){
		  return hybridHelper.generateNavLink(pageURL);
		} else if(isSFDC && isSFDCLighting) {
		  pageURL = window.location.origin + pageURL;
		  return sfdcHelper.getURLForLightning(pageURL);
		}
		return pageURL;
	  }

		public checkIfMappingField(fieldMeta, describeData: FieldTreeNode[]){
            const path = fieldInfo2path({leftOperand:fieldMeta}, describeData);
			if(path) {
				const describeField = path[path.length - 1].data;
				if(describeField.meta && describeField.meta.mappings){
					fieldMeta.mappings = describeField.meta.mappings;
				}
				return fieldMeta;
			}
		}
			
	getModifiedColumnDefs(columnDefs: AGGridColumn[], describeData: FieldTreeNode[]) {
		return map(columnDefs, (columnDef: AGGridColumn) => {
            if(columnDef.field == 'company_Name' || columnDef.field ==  "relationship_Name"){
                columnDef.lockPosition = true;
                columnDef.pinned = 'left';
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
				let cellRenderer: any = {
					'cellRenderer': (params) => {
						let value;
						let cssClass;
						let linkValue = "";
						if(params.colDef.dataType === DataTypes.URL && !params.colDef.editable) {
							value = this.customURLCellRenderer(params.colDef, params);
						} else {
							if(this.getIsCompanyOrRelationshipName(fieldMeta) && !params.colDef.editable) {
								linkValue = this.getLinkValue(params, fieldMeta.objectName);
							}
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
						const html = params.valueFormatted === "NULL" ? '---' : params.valueFormatted;;
						const doc = new DOMParser().parseFromString(html, 'text/html');
						const anchorElement = doc.querySelector('a');
						if (anchorElement) {
							anchorElement.setAttribute('target', '_blank');
							var modifiedValue = new XMLSerializer().serializeToString(doc);
						} else {
							modifiedValue = value;
						}
						return linkValue ? `<a class="${cssClass}" href="${linkValue}" target="_blank">${escape(value)}</a>` : columnDef.mappings ? '<span class="'+ cssClass + '">' + escape(value) + '</span>' : '<span class="'+ cssClass + '">' + modifiedValue + '</span>';
					}
				};
                if(columnDef.field === HealthScoreFields.COMPANY_HEALTHSCORE || columnDef.field === HealthScoreFields.RELATIONSHIP_HEALTHSCORE) {
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
				}

			}
			return columnDef;
		});
	}

	protected getTooltipValueGetter() {
		let toolTipValueGetter;
		toolTipValueGetter = (params)=> params.value && params.value.fv ? params.value.fv:  "";
		return toolTipValueGetter;
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
        this.totalRecordsCount = this.reportViewer.pageInfo.recordCount;
    }

    onGridAction(event: any) {
        switch (event.action) {
            case PORTFOLIO_GRID_ACTIONS.GRID_READY:
                this.gridApi = event.payload.event.api;
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
				//Copied addFilters from core and added to core-references. Changed name of util to avoid confusion.
				//Tried using the same form @gs/report but the implementation is different
                this.reportMaster.whereFilters = ReportFilterUtilsCore.addFilters({}, this.gridPreProcessor.getGridState().filters.where || []) || {};
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
                this.action.emit({action: PORTFOLIO_GRID_ACTIONS.SORT, info: this.reportMaster.orderByFields});
                break; 
            case PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE:
                this.reportViewer.loading = true;
                this.onPageSizeChange(event);
                this.action.emit({action: PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE, info: this.reportMaster.pageSize});
                break;
			case PORTFOLIO_GRID_ACTIONS.COLUMN_MOVE:
				this.action.emit({action: PORTFOLIO_GRID_ACTIONS.COLUMN_MOVE, info: event.data});
				break;
		}
    }

    protected onPageSizeChange(event: any): void {
      const currentPageSize: number = event.data;
	  //Platform changes: this method always returns true and is deprecated in reportUtils. Hence, commenting it out.
      //if(ReportValidationUtils.limitShouldBeLessThanOrEqualToPageSize(this.reportMaster.limit || 0, currentPageSize)) {
        this.reportViewer.config.additionalOptions.customPaginator.currentPageNum = 1;
        this.reportViewer.config.additionalOptions.customPaginator.currentPageSize = currentPageSize;
        this.reportMaster.offset = 0;
        this.reportMaster.pageSize = currentPageSize;
      //}
    }

    protected performServerSearch(filters: any) {
      const where: any[] = [], having: any[] = [];
      const parsedFilters: any[] = ReportUtils.parsedFilters(filters);
      this.reportMaster.offset = 0;
      this.reportViewer.config.additionalOptions.customPaginator.currentPageNum = 1;
      parsedFilters.forEach((filterItem: any, index: number) => {
        const filterField: ReportGSField = this.gridPreProcessor.getReportGSFilterField(filterItem);
        const alias = ReportFilterUtils.getFilterAlias({}, index);
        where.push(ReportFilterUtils.getWhereFilters(filterField, filterItem.operator.toUpperCase(), alias, filterItem.value));
      });
      this.gridPreProcessor.setGridState({filters: {where, having}});
    }

    protected performServerSort(event: any) {
      const sortOrder = this.gridPreProcessor.getOrderByFields(event);
      this.gridPreProcessor.setGridState({order: sortOrder});
	}
	
	private customURLCellRenderer(column: ReportGSField, params: any) {
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
