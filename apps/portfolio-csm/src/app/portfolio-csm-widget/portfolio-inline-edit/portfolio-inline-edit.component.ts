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
  ViewChild,
  ElementRef
  } from '@angular/core';
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import filter from "lodash/filter";
import find from "lodash/find";
import forEach from "lodash/forEach";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import findIndex from "lodash/findIndex";
import {
  getFieldId,
  PortfolioWidgetGridComponent,
  PORTFOLIO_GRID_ACTIONS,
  PORTFOLIO_WIDGET_CONSTANTS,
  PORTFOLIO_WIDGET_MESSAGE_CONSTANTS,
  getFieldMeta,
  isRelationshipEnabled, FilterInfo
} from '@gs/portfolio-lib';
import { PortfolioCsmWidgetService } from '../portfolio-csm-widget.service';
import { GridRequestSource, PortfolioConfig, PortfolioEditRequestInfo, PortfolioGridActionInfo, PortfolioGridInfo, PortfolioGridState, WidgetField } from '@gs/portfolio-lib';
import { SubSink } from 'subsink';
import { PortfolioCsmWidgetFacade } from '../state/portfolio-csm-widget.facade';
import { MessageType } from '@gs/gdk/core';
import keys from "lodash/keys";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';
import {
  PortfolioBulkEditModalComponent
} from "../portfolio-bulk-edit/portfolio-bulk-edit-modal/portfolio-bulk-edit-modal.component";
import {NzModalService} from "@gs/ng-horizon/modal";
import { NzNotificationService } from '@gs/ng-horizon/notification';
import {NzOverlayComponent} from "@gs/ng-horizon/popover";

@Component({
  selector: 'gs-portfolio-inline-edit',
  templateUrl: './portfolio-inline-edit.component.html',
  styleUrls: ['./portfolio-inline-edit.component.scss']
})
export class PortfolioInlineEditComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild("portfolioGrid", { static: false }) portfolioGridComponent: PortfolioWidgetGridComponent;
  @ViewChild("popoverEle", { static: false }) private popOver: NzOverlayComponent;

  @Input() describeObjFieldTreeMap: any;
  @Input() widgetRequestSource: string;
  @Input() config: PortfolioConfig;
  @Input() globalFilter: FilterInfo | FilterInfo[];
  @Input() configuredObjectNames: string[];
  @Input() loadWidgetData = true;

  @Output() bulkEditClicked = new EventEmitter<boolean>();
  @Output() gridLoaded = new EventEmitter();
  @Output() portfolioIdUpdated = new EventEmitter<PortfolioConfig>();

  objectName: string;
  applicableFilters: any;
  loading = false;
  showFullScreen = false;
  showColumnChooser = false;
  gridState: PortfolioGridState;
  columnChooserConfig:any;
  isBulkEditCompany: boolean;
  choosenFieldsFromColumnChooser: { company: Array<string>, relationship: Array<string> } = {
    company: [],
    relationship: []
  };
  displayFieldsFromColumnChooser: { company: Array<string>, relationship: Array<string> } = {
    company: [],
    relationship: []
  };
  selectedGridRows = {company: [], relationship: []};
  loaderOptions = PORTFOLIO_WIDGET_CONSTANTS.LOADER_OPTIONS;
  gridRequestSource: GridRequestSource;
  relationshipGridInfo: PortfolioGridInfo = <any>{};
  companyGridInfo: PortfolioGridInfo = <any>{};
  selectedGridInfo: PortfolioGridInfo = <any>{};
  widgetConfig: PortfolioConfig;
  triggerReload = false;
  columnChooserFields = [];
  isRelationshipEnabled = true;
  allowedFields: WidgetField[] = [];
  saveConfigData: any;
  disabledColumns: any[] = [];
  selectedColumns = ["Name", "Gsid"];
  clonedFields: any[];

  private tabSwitched = false;
  private subs = new SubSink();

  constructor(private portfolioCsmWidgetService: PortfolioCsmWidgetService,
    private cdr: ChangeDetectorRef,
    @Inject("envService") public env: EnvironmentService,
    private notificationService: NzNotificationService,
    private portfolioCsmWidgetFacade: PortfolioCsmWidgetFacade,
    private i18nService: NzI18nService,
    private modalService: NzModalService
  ) {
    this.isRelationshipEnabled = isRelationshipEnabled(this.env.gsObject);
    this.subs.add(this.portfolioCsmWidgetService.portfolioDataObservable.subscribe(response => {
      if(response.configuration) {
        response.configuration.showFields = sortBy(this.widgetConfig.configuration[this.objectName].showFields, ['displayOrder']);
        if(this.gridState.offset === 0) {
          response.configuration.offset = 0;
        }
        if(!this.loadWidgetData) {
          response.data = [];
        }
      }
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
        this.selectedGridInfo = this.companyGridInfo = {
          reportMaster: response.configuration,
          data: response,
          triggerReload: this.triggerReload,
          globalFilter: this.applicableFilters,
          noRowsOverlayComponentParams: !this.loadWidgetData ?
          {title: this.i18nService.translate('360.csm.inline_edit.companyOverlay'), message: ""} :
          {title: this.i18nService.translate('360.csm.inline_edit.noDataFound'), message: this.i18nService.translate('360.csm.inline_edit.changeFilters')}
        }
      } else {
        this.selectedGridInfo = this.relationshipGridInfo = {
          reportMaster: response.configuration,
          data: response,
          triggerReload: this.triggerReload,
          globalFilter: this.applicableFilters,
          noRowsOverlayComponentParams: !this.loadWidgetData ?
          {title: this.i18nService.translate('360.csm.inline_edit.companyOverlay'), message: ""} :
          {title: this.i18nService.translate('360.csm.inline_edit.noDataFound'), message: this.i18nService.translate('360.csm.inline_edit.changeFilters')}
        }
      }
      this.cdr.detectChanges();
      this.tabSwitched = false;
      this.triggerReload = false;
      this.loading = false;
    }));
  }

  ngOnInit() {
      this.clonedFields = cloneDeep(this.displayFieldsFromColumnChooser[this.objectName]).filter(field => !field.hidden);
      this.setAllowedFields();
      this.disabledColumns = ["Name", "Gsid"];
      this.setSelectedColumns();
  }

  private setSelectedColumns() {
    this.selectedColumns = filter(this.clonedFields, field => !field.hidden);
  }

  openTreePopover(evt){
    this.popOver.open(new ElementRef(evt.target));
  }

  applyMultiSelect(event) {
    const selected = (event.value || []);
    const newFields = [];
    this.clonedFields.forEach(field => {
      if(selected.includes(field.fieldName)){
        newFields.push(field);
      }
    });
    this.popOver.close();
    this.onColumnChooserSave(newFields);
  }

  cancelMultiSelect(event) {
    this.setSelectedColumns();
    this.popOver.close();
  }

    private setAllowedFields() {
        this.allowedFields = [];
        forEach((this.config.configuration[this.objectName].showFields).filter(field => !field.hidden), field => {
            if(field.editable && !field.hidden) {
                setTimeout(() => {
                    const meta = getFieldMeta(field, this.describeObjFieldTreeMap[this.objectName], this.objectName);
                    meta.displayName = field.displayName;
                    this.allowedFields.push(meta);
                }, 1000)

            }
        })
    }

  ngOnChanges(changes: SimpleChanges) {
    if((changes.config || changes.globalFilter) && !isEmpty(this.config)) {
      this.widgetConfig = cloneDeep(this.config);
      this.setReportMaster();
      if(this.widgetRequestSource) {
        this.setGridRequestSource();
        this.setColumnChooserConfig();
      }
    } else if(changes.loadWidgetData) {
      this.setReportMaster();
    }
  }

  resizeGrid() {
    this.portfolioGridComponent.resizeToParentDimensions();
  }

  private setGridGlobalFilters() {
    if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
      this.companyGridInfo.globalFilter = this.applicableFilters;
    } else {
      this.relationshipGridInfo.globalFilter = this.applicableFilters;
    }
  }

  setGridRequestSource() {
    switch(this.widgetRequestSource) {
      case PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.GS_HOME_BUILDER:
        this.showColumnChooser = true;
        this.gridRequestSource = GridRequestSource.USERCONFIG;
        break;
      case PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.GS_HOME_PREVIEW:
        this.gridRequestSource = GridRequestSource.ADMINCONFIG;
        break;
      case PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.GS_HOME:
        this.gridRequestSource = GridRequestSource.BULKEDIT;
        this.showFullScreen = true;
        this.showColumnChooser = true;
        break;
      case PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.DASHBOARD_PAGE:
        this.gridRequestSource = GridRequestSource.BULKEDIT;
        this.showFullScreen = true;
        this.showColumnChooser = true;
        break;
      case PORTFOLIO_WIDGET_CONSTANTS.RESOURCE_TYPES.DASHBOARD_EXTERNAL:
        this.showColumnChooser = true;
        break;
    }
  }

  setColumnChooserConfig(choosenFields = []) {
    this.displayFieldsFromColumnChooser[this.objectName] = this.widgetConfig.configuration[this.objectName].showFields;
    // console.log('display field', this.displayFieldsFromColumnChooser[this.objectName])
    //   console.log('choosenFields',choosenFields)
    const previousFields = choosenFields.length ?
                            choosenFields :
                            filter(this.widgetConfig.configuration[this.objectName].showFields, f => !f.hidden);
    // console.log('previousFields', previousFields)
    this.columnChooserConfig = {
      objectNames: [this.objectName],
      baseObjectName: this.objectName,
      baseObjectFieldNames : {
        company : "CompanyId",
        relationship : "RelationshipId"
      },
      levels: 1,
      previousFields,
      showCollapsibleSection: true,
      showExtraSection: false
    }
  }

  onColumnChooserSave(fields) {
    this.loading = true;
    this.setColumnChooserConfig(fields);
    this.choosenFieldsFromColumnChooser[this.objectName] = fields;
    forEach(this.widgetConfig.configuration[this.objectName].showFields, f => {
      const field = find(this.choosenFieldsFromColumnChooser[this.objectName], preSelectedField => {
        if(preSelectedField.fieldPath) {
          return preSelectedField.fieldName === f.fieldName && f.fieldPath && preSelectedField.fieldPath.lookupId === f.fieldPath.lookupId;
        } else {
          return preSelectedField.fieldName === f.fieldName && !f.fieldPath;
        }
      });
      f.hidden = !field;
    });
    this.updateUserConfigToServer();
  }

  updateUserConfigToServer() {
    this.subs.add(this.portfolioCsmWidgetService.updateUserConfig(this.widgetConfig).subscribe(response => {
      this.portfolioIdUpdated.emit(response);
      this.widgetConfig = response;
      this.triggerReload = true;
      this.setReportMaster();
    }));
  }

  onGridAction(actionInfo: PortfolioGridActionInfo, objectName) {
    switch (actionInfo.action) {
        case PORTFOLIO_GRID_ACTIONS.ROW_SELECTION_CHANGED:
            this.selectedGridRows[objectName] = actionInfo.info;
            break;
      case PORTFOLIO_GRID_ACTIONS.GRID_READY:
        this.gridLoaded.emit();
        break;
      case PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE:
        this.gridState.pageSize = actionInfo.info;
        this.gridState.offset = 0;
        this.portfolioCsmWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.PREVIOUS_PAGE:
      case PORTFOLIO_GRID_ACTIONS.NEXT_PAGE:
        this.gridState.offset = actionInfo.info;
        this.portfolioCsmWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.SEARCH:
        this.gridState.offset = 0;
        this.gridState.whereFilters = actionInfo.info;
        this.portfolioCsmWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.SORT:
        this.gridState.orderByFields = actionInfo.info;
        this.portfolioCsmWidgetService.setGridState(this.gridState, this.objectName);
        break;
      case PORTFOLIO_GRID_ACTIONS.CELL_EDIT:
        this.updatePortfolioData(actionInfo.info);
        break;
      case PORTFOLIO_GRID_ACTIONS.CELL_EDIT_INVALID:
        this.portfolioCsmWidgetFacade.showToastMessage(PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.INVALID_VALUE, MessageType.ERROR);
        break;
      case PORTFOLIO_GRID_ACTIONS.COLUMN_MOVED:
        if(actionInfo.info.colsState) {
          this.updateWidgetConfig(actionInfo.info.colsState);
        }
        break;
    }
  }

  updateWidgetConfig(colsState: any) {
    forEach(this.widgetConfig.configuration[this.objectName].showFields, f => {
      f.displayOrder =  findIndex(colsState, col => {
        return f.fieldAlias === col.colId;
      });
    });
    this.updateUserConfigToServer();
  }

  updatePortfolioData(gridData: any) {
    const info: PortfolioEditRequestInfo = <any>{};
    info.portfolioId = this.widgetConfig.portfolioId;
    info.gsids = [gridData.data[this.objectName + "_Gsid"].v];
    info.fieldDetails = {};
    const fieldId = getFieldId(gridData.colDef.cellEditorParams.field);
    info.fieldDetails[fieldId] = gridData.data[gridData.colDef.colId].inlineEditData.k;
    this.subs.add(this.portfolioCsmWidgetService.updatePortfolioRecord(this.objectName, info).subscribe(response => {
      if(response.error) {
        const respData = cloneDeep(gridData.data);
        respData.id = gridData.node.id;
        delete respData[gridData.colDef.colId].inlineEditData;
        gridData.api.updateRowData({update: [respData]});
          this.notificationService.create('error', '', response.error.message, [], { nzDuration: 2000 });
        return;
      }
      const responseData = response.data[0];
      responseData.id = gridData.node.id;
      gridData.api.updateRowData({update: [responseData]});
      let objName = this.objectName === 'company' ? this.i18nService.translate('360.csm.objectNames_company') : this.i18nService.translate('360.csm.objectNames_relationship');
      this.notificationService.create('success', '', `${objName} ` + this.i18nService.translate('360.csm.update_success'), [], { nzDuration: 2000 });
    }));
  }

  setReportMaster() {
    if(!this.tabSwitched && !this.objectName) {
      this.objectName = this.widgetConfig.configuration.company.showTab ? PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME : PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME;
    }
    let selectedGridInfo;
    if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
      selectedGridInfo = this.companyGridInfo;
    } else {
      selectedGridInfo = this.relationshipGridInfo;
    }
    // this will update loader even for tab switch, need to change this
    // if(this.tabSwitched && isEqual(selectedGridInfo.globalFilter, this.applicableFilters) && !isEmpty(selectedGridInfo.data)) {
    //   return;
    // }
    this.loading = true;
    this.setApplicableFilters();
    this.setGridGlobalFilters();
    this.gridState = this.portfolioCsmWidgetService.getInitialGridState(this.tabSwitched ? null : this.gridState);
    if(!isEqual(selectedGridInfo.globalFilter, this.globalFilter)) {
      this.gridState.offset = 0;
    }
    this.gridState.globalFilter = this.applicableFilters;
    this.gridState.portfolioId = this.widgetConfig.portfolioId;
    this.portfolioCsmWidgetService.setGridState(this.gridState, this.objectName);
  }

  onTabChange(event: any) {
    this.tabSwitched = true;
    // const selectedTab = event.tab.nzTitle.toLowerCase();
    const selectedTab = event.index === 0 ? 'company': 'relationship';
    this.objectName = selectedTab;
    this.setReportMaster();
    this.setColumnChooserConfig(this.choosenFieldsFromColumnChooser[this.objectName]);
    this.setAllowedFields();
  }

  setApplicableFilters(){
    if(!this.widgetRequestSource.includes("DASHBOARD")) {
      this.applicableFilters = this.globalFilter;
      return;
    }
    const applicableFilters = {conditions: []};
    forEach(this.globalFilter, f => {
      const companyFilter = f.filter(widget => widget.sourceDetails.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) || [];
      const relationshipFilter = f.filter(widget => widget.sourceDetails.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME) || [];
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME && companyFilter.length) {
        applicableFilters.conditions.push(companyFilter[0].filter);
      }
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME && relationshipFilter.length) {
        applicableFilters.conditions.push(relationshipFilter[0].filter);
      }
    });
    if (applicableFilters) {
      applicableFilters.conditions.forEach(condition => {
        /* tslint:disable:no-string-literal */
        condition['rightOperandType'] = 'VALUE';
      });
    }
    this.applicableFilters = applicableFilters;
  }

  bulkEdit() {
    this.bulkEditClicked.emit(true);
  }

  editFields() {
    const modal = this.modalService.create({
      nzContent: PortfolioBulkEditModalComponent,
      nzComponentParams: {
        fields: this.allowedFields
      },
      nzTitle: this.i18nService.translate('360.csm.bulk_edit_modal.editFields'),
      nzFooter: [
        {
          type: 'default',
          shape: 'round',
          label: this.i18nService.translate('360.csm.bulk_edit_modal.cancelBtn'),
          onClick: () => {
            modal.close();
          }
        },
        {
          type: 'primary',
          shape: 'round',
          label: this.i18nService.translate('360.csm.bulk_edit_modal.applyBtn'),
          onClick: () => {
            if(!this.saveConfigData || !this.saveConfigData.valid) {
              this.portfolioCsmWidgetFacade.showToastMessage(PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.INVALID_VALUE, MessageType.ERROR);
              return;
            } else {
              modal.close();
              this.onSave();
            }
          }
        }
      ]
    });
    this.subs.add(
      modal.afterOpen.subscribe((val) => {
        this.subs.add(
          modal.getContentComponent().formValueUpdated.
          subscribe((v) => {
            this.updateSaveConfigData(v);
          })
        );
      })
    );
  }

  updateSaveConfigData(data) {
    this.saveConfigData = data;
  }

  onSave() {
    if (!this.saveConfigData || !this.saveConfigData.valid) {
        this.portfolioCsmWidgetFacade.showToastMessage(PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.INVALID_VALUE, MessageType.ERROR);
        return;
    }
    this.loading = true;
    const requestInfo: PortfolioEditRequestInfo = <any>{fieldDetails: {}};
    forEach(keys(this.saveConfigData), key => {
        requestInfo.fieldDetails[key] = this.saveConfigData[key].k;
    });
    requestInfo.gsids = [];
    this.selectedGridRows[this.objectName].forEach(node => {
        requestInfo.gsids.push(node.data[this.objectName + "_Gsid"].v);
    })
    requestInfo.portfolioId = this.config.portfolioId;
    this.subs.add(this.portfolioCsmWidgetService.updateBulkPortfolioRecords(this.objectName, requestInfo).subscribe(response => {
        this.setReportMaster();
        this.saveConfigData = null;
        if(response.error) {
          this.notificationService.create('error', '', response.error.message, [], { nzDuration: 2000 });
        } else {
          let objName = this.objectName === 'company' ? this.i18nService.translate('360.csm.objectNames_company') : this.i18nService.translate('360.csm.objectNames_relationship');
          this.notificationService.create('success', '', `${objName} ` + this.i18nService.translate('360.csm.update_success'), [], { nzDuration: 2000 });
        }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
