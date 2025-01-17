import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
  } from '@angular/core';
import forEach from "lodash/forEach";
import isEmpty from "lodash/isEmpty";
import keys from "lodash/keys";
import sortBy from "lodash/sortBy";
import isEqual from "lodash/isEqual";
import {
  getFieldId,
  getFieldMeta,
  GridRequestSource,
  isRelationshipEnabled,
  PortfolioConfig,
  PortfolioEditRequestInfo,
  PortfolioGridActionInfo,
  PortfolioGridInfo,
  PortfolioGridState,
  PortfolioScopes,
  PortfolioWidgetGridComponent,
  PORTFOLIO_WIDGET_MESSAGE_CONSTANTS,
  WidgetField
  } from '@gs/portfolio-lib';
import { FieldTreeNode, Operator} from "@gs/gdk/core";
import { getFieldsInFilter, FilterQueryService } from "@gs/gdk/filter/builder";
import find from "lodash/find";
import { PORTFOLIO_GRID_ACTIONS, PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { PortfolioCsmWidgetService } from '../portfolio-csm-widget.service';
import { SubSink } from 'subsink';
import { MessageType } from '@gs/gdk/core';
import { PortfolioCsmWidgetFacade } from '../state/portfolio-csm-widget.facade';
import {EnvironmentService, UserService} from "@gs/gdk/services/environment";
import { GSGlobalFilter } from "@gs/gdk/filter/global/core/global-filter.interface";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import {NzModalService} from "@gs/ng-horizon/modal";
import {PortfolioBulkEditModalComponent} from "./portfolio-bulk-edit-modal/portfolio-bulk-edit-modal.component";
import {FloatingFilterUtils} from "@gs/portfolio-lib/src/utils/FloatingFilterUtils";
import { GSField } from "@gs/gdk/core";
import { DataTypes } from '@gs/portfolio-lib';

export const GLOBAL_FILTER_CONSTANTS = {
  TOKENIZED: true,
  HOST: { id: "mda", name: "mda", type: "mda", apiContext : 'api/reporting/describe'},
  BASE_OBJECT: 'company',
  OBJECT_LIST: [{
    label: "360.csm.relationship_view.company",
    value: "company",
    excludeFields: [],
    nestLevels: 2
  }, {
    label: "360.csm.relationship_view.relationship",
    value: "relationship",
    excludeFields: [],
    nestLevels: 2
  }],
  NEST_LEVELS: 2,
  ADD_DEFAULT_RULE: true,
  EMPTYGLOBALFILTERS : {
    "conditions": [],
    "expression": ""
  }
};

export const GLOBAL_FILTER_EVENTS = {
  VALUE_UPDATED : "VALUE_UPDATED",
  FILTER_CLOSED : "FILTER_CLOSED",
  FILTER_OPEN : "FILTER_OPEN",
  CONFIGURE : "CONFIGURE",
  REMOVE : "REMOVE",
  OPERATION_ON_FILTER_CHIP : 'OPERATION_ON_FILTER_CHIP',
  OPERATION_ON_FILTER_CHIP_DONE : 'OPERATION_ON_FILTER_CHIP_DONE',
  MODIFY_GLOBAL_FILTERS: 'MODIFY_GLOBAL_FILTERS'
}

@Component({
  selector: 'gs-portfolio-bulk-edit',
  templateUrl: './portfolio-bulk-edit.component.html',
  styleUrls: ['./portfolio-bulk-edit.component.scss']
})
export class PortfolioBulkEditComponent implements OnInit, OnDestroy {

  @ViewChild("relationshipGrid", { static: false }) relationshipGridComponent: PortfolioWidgetGridComponent;
  @ViewChild("companyGrid", { static: false }) companyGridComponent: PortfolioWidgetGridComponent;

  @Input() describeObjFields: any;
  @Input() config: PortfolioConfig;
  @Input() filters: GSGlobalFilter;
  @Input() configuredObjectNames: string[];

  loading = false;
  allowedFields: WidgetField[] = [];
  objectName: string;
  gridState: PortfolioGridState;
  selectedGridRows = {company: [], relationship: []};
  companyGridInfo: PortfolioGridInfo = <any>{};
  relationshipGridInfo: PortfolioGridInfo = <any>{};
  selectedGridInfo: PortfolioGridInfo = <any>{};
  saveConfigData: any;
  requestSource = GridRequestSource.BULKEDIT;
  filterFields: WidgetField[] = [];
  applicableFilters: any;
  filterConfig: any;
  loaderOptions = PORTFOLIO_WIDGET_CONSTANTS.LOADER_OPTIONS;
  isRelationshipEnabled = false;
  isHome = false;

  private tabSwitched = false;
  private subs = new SubSink();
  public companyLabel = this.i18nService.translate('360.admin.portfolio_admin.companiesSelected');
  public relationshipLabel = this.i18nService.translate('360.admin.portfolio_admin.relationshipsSelected');
  queryBuilderOptions:any;
  sourceDetailsByObject = {
    COMPANY: {
      objectName: "company",
      objectLabel: 'Company',
      connectionId: "MDA",
      connectionType: "MDA",
      dataStoreType: "HAPOSTGRES"
    },
    RELATIONSHIP: {
      objectName: "relationship",
      objectLabel: 'Relationship',
      connectionId: "MDA",
      connectionType: "MDA",
      dataStoreType: "HAPOSTGRES"
    }
  };

  globalFilterFields:any = [];

  constructor(
    private portfolioCsmWidgetService: PortfolioCsmWidgetService,
    private portfolioCsmWidgetFacade: PortfolioCsmWidgetFacade,
    @Inject("envService") protected env: EnvironmentService,
    private fqr: FilterQueryService,
    private userService: UserService,
    private i18nService: NzI18nService,
    private modalService: NzModalService
  ) {
    this.isRelationshipEnabled = isRelationshipEnabled(this.env.gsObject);
    this.subs.add(this.portfolioCsmWidgetService.portfolioDataObservable.subscribe(response => {
      if(response.configuration) {
        response.configuration.showFields = sortBy(this.config.configuration[this.objectName].showFields, ['displayOrder']);
        if(this.gridState.offset === 0) {
          response.configuration.offset = 0;
        }
      }
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
        this.selectedGridInfo = this.companyGridInfo = {
          data:response,
          reportMaster: response.configuration,
          globalFilter: this.applicableFilters
        }
      } else {
        this.selectedGridInfo = this.relationshipGridInfo = {
          data:response,
          reportMaster: response.configuration,
          globalFilter: this.applicableFilters
        }
      }
      this.loading = false;
      this.tabSwitched = false;
    }));
  }

  async ngOnInit() {
    this.objectName = this.config.configuration.company.showTab ? PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME : PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME;
    this.filters = {...this.filters};
    this.setReportMaster();
    this.setGlobalFilterConfig();
    this.setAllowedFields();
    const filterConfig = this.getGlobalFilterConfig();
    this.queryBuilderOptions = {
      config: filterConfig,
      currencyConfig: filterConfig.currency,
      maxRules: 26,
      tokenized: false,
      baseObject: "company",
      allowConditionalLogic: true,
        fieldSearchSetting: {
            maintainDefaultOrder: false
        },
        disableSaveBtn: false
    }
    this.globalFilterFields = await this.getFilterFields();
    this.isHome = this.config.portfolioScope.toUpperCase() === PortfolioScopes.GSHOME.toUpperCase();
  }
  private setGlobalFilterConfig(reset?: boolean) {
    this.filterConfig = this.getGlobalFilterConfig();
    if(reset) {
      this.setReportMaster();
    }
  }

  setApplicableFilters(){
    if(this.config.portfolioScope !== PortfolioScopes.DASHBOARD) {
      this.applicableFilters = this.applicableFilters ? this.applicableFilters : this.filters;
      return;
    }
    const applicableFilters = {conditions: []};
    forEach(this.filters, filter => {
      const companyFilter = filter.filter(widget => widget.sourceDetails.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) || [];
      const relationshipFilter = filter.filter(widget => widget.sourceDetails.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME) || [];
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME && companyFilter.length) {
        applicableFilters.conditions.push(companyFilter[0].filter);
      }
      if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME && relationshipFilter.length) {
        applicableFilters.conditions.push(relationshipFilter[0].filter);
      }
    });
    applicableFilters.conditions.forEach(condition => {
      condition.rightOperandType = 'VALUE';
    });
    this.applicableFilters = {...applicableFilters};
  }

  private getGlobalFilterConfig() {
    const host = this.env.instanceDetails;
    const user = this.getUserConfigByHostType();
    if(!!host) {
      const locale = host.locale;
      const currency = host.currency;
      const search = this.env.hostDetails.search;
      let operatorMap = FloatingFilterUtils.getOperatorMap();
      operatorMap = this.getTranslatedLabelOperator(operatorMap);
      return {
        locale,
        currency,
        search,
        user,
        nestOnDemand: true,
        baseObjects: this.isRelationshipEnabled ? GLOBAL_FILTER_CONSTANTS.OBJECT_LIST : GLOBAL_FILTER_CONSTANTS.OBJECT_LIST.filter(obj => obj.value !== "relationship"),
        showLookupInfo: true,
        // Added fiscal support.
        // dateLiterals: [{ value: "CUSTOM", label: "Custom" }],
        // Added operator map
        operatorMap,
        // Added includes null
        honorIncludeNulls: true,
        // Check for strictness of expression
        strictCheck: false,
        // Show skeleton
        showSkeleton: true,
        // Added isApplicable option to rule
        honorIsApplicable: true,
        getDefaultOperator: (
          selectedField: FieldTreeNode,
          operatorsList: Operator[]
        ) => {
          if (selectedField.data.meta && selectedField.data.meta.nameField) {
            return "EQ";
          } else {
            return operatorsList.find(op => op.default).value;
          }
        }
      };
    }
  }

  private setGridGlobalFilters() {
    if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
      this.companyGridInfo.globalFilter = this.applicableFilters;
    } else {
      this.relationshipGridInfo.globalFilter = this.applicableFilters;
    }
  }

  private getUserConfigByHostType(): any {
    return !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
  }

  onFilterAction(evt:any) {
    switch(evt.type) {
      case GLOBAL_FILTER_EVENTS.VALUE_UPDATED:
      case GLOBAL_FILTER_EVENTS.REMOVE:
      case GLOBAL_FILTER_EVENTS.MODIFY_GLOBAL_FILTERS:
        this.applicableFilters = evt.data.globalFilters;
        this.setGlobalFilterConfig(true);
        break;
    }
  }

  async getFilterFields(): Promise<any[]> {
    const fieldsInFilter: Array<{
      field: any;
      pathArray: any[];
    }> = getFieldsInFilter(this.filters);
    const fieldsToFetch = [];
    for (const fld of fieldsInFilter) {
      for (const pField of fld.pathArray) {
        if (
          !find(fieldsToFetch, {
            fieldName: pField.fieldName,
            objectName: pField.objectName
          })
        ) {
          fieldsToFetch.push({
            fieldName: pField.fieldName,
            objectName: pField.objectName,
            connectionId: pField.connectionId || "MDA",
            connectionType: pField.connectionType || "MDA"
          });
        }
      }
    }
    if (fieldsToFetch.length) {
      return this.fqr.getDescribeFields(fieldsToFetch, {
        includePickList: true,
        honorUserContext: false
      });
    } else {
      return Promise.resolve([]);
    }
  }

  private setAllowedFields() {
    this.allowedFields = [];
    forEach(this.config.configuration[this.objectName].showFields, field => {
      if(field.editable && !field.hidden) {
        const meta = getFieldMeta(field, this.describeObjFields[this.objectName], this.objectName);
        meta.displayName = field.displayName;
        this.allowedFields.push(meta);
      }
    })
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

  setReportMaster() {
    let selectedGridInfo: PortfolioGridInfo;
    if(this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
      selectedGridInfo = this.companyGridInfo;
    } else {
      selectedGridInfo = this.relationshipGridInfo;
    }
    if(this.tabSwitched && isEqual(selectedGridInfo.globalFilter || {}, this.applicableFilters) && !isEmpty(selectedGridInfo.data)) {
      this.tabSwitched = false;
      return;
    }
    this.loading = true;
    this.setApplicableFilters();
    this.setGridGlobalFilters();
    this.gridState = this.portfolioCsmWidgetService.getInitialGridState(this.tabSwitched ? null : this.gridState);
    if(!isEqual(selectedGridInfo.globalFilter, this.applicableFilters)) {
      this.gridState.offset = 0;
    }
    this.gridState.portfolioId = this.config.portfolioId;
    this.gridState.globalFilter = this.applicableFilters;
    this.portfolioCsmWidgetService.setGridState(this.gridState, this.objectName);
  }

  onTabChange(event: any) {
    const grid = this.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME ? this.companyGridComponent : this.relationshipGridComponent;
    grid.deselectRows();
    this.tabSwitched = true;
    // const selectedTab = event.tab.nzTitle.toLowerCase();
    const selectedTab = event.index === 0 ? 'company': 'relationship';
    this.objectName = selectedTab;
    this.selectedGridRows = {company: [], relationship: []};
    this.setReportMaster();
    this.setAllowedFields();
  }

  updateSaveConfigData(data) {
    this.saveConfigData = data;
  }

  onSave() {
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
    }));
  }

  onGridAction(actionInfo: PortfolioGridActionInfo, objectName: string) {
    switch (actionInfo.action) {
      case PORTFOLIO_GRID_ACTIONS.ROW_SELECTION_CHANGED:
        this.selectedGridRows[objectName] = actionInfo.info;
        break;
      case PORTFOLIO_GRID_ACTIONS.GRID_READY:
        break;
      case PORTFOLIO_GRID_ACTIONS.PAGESIZE_CHANGE:
        this.gridState.pageSize = actionInfo.info;
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
    }
  }

  updatePortfolioData(gridData: any) {
    const info: PortfolioEditRequestInfo = <any>{};
    info.portfolioId = this.config.portfolioId;
    info.gsids = [gridData.data[this.objectName + "_Gsid"].v];
    info.fieldDetails = {};
    const fieldId = getFieldId(gridData.colDef.cellEditorParams.field);
    info.fieldDetails[fieldId] = gridData.data[gridData.colDef.colId].inlineEditData.k;
    this.subs.add(this.portfolioCsmWidgetService.updatePortfolioRecord(this.objectName, info).subscribe(response => {
      const responseData = response.data[0];
      responseData.id = gridData.node.id;
      gridData.api.updateRowData({update: [responseData]});
    }));
  }

  public getTranslatedLabelOperator(filterOperatorMap) {
    const operatorMap = {};
    Object.keys(filterOperatorMap).forEach(key => {
      operatorMap[key] = (filterOperatorMap[key] || []).map(type => {
        return {
          ...type,
          label: this.i18nService.translate(type.label)
        }
      });
    });
    return operatorMap;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  fieldFilterFunction = (function(fields: GSField[]): GSField[] {
    return fields.filter(field => {
        return !field.meta.formulaField  &&  field.dataType !== DataTypes.IMAGE;
    });
  });

}
