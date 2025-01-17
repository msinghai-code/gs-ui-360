  import {
  Component,
  ComponentFactoryResolver,
  Directive,
  OnInit,
  Input,
  ViewChild,
  ViewContainerRef,
  SimpleChanges,
  ElementRef, Output, EventEmitter, Inject, HostListener,
  TemplateRef
} from '@angular/core';

import { ReportFilter } from "@gs/report/pojos";
import { ReportFilterUtils} from "@gs/report/utils";
import { MessageType } from '@gs/gdk/core';
import { StateAction } from '@gs/gdk/core';
import {isEmpty, cloneDeep, isEqual} from "lodash";
import { NzMessageService } from '@gs/ng-horizon/message';
import {RelationshipTypeViewComponent} from "./relationship-type-view/relationship-type-view.component";
import {RelationshipFilterViewComponent} from "./relationship-filter-view/relationship-filter-view.component";
import { RelationshipFormComponent } from './../../../../relationship-form/relationship-form.component';
import { ReportWidgetCs360ElementLoader, MiniPrefix } from '@gs/cs360-lib/src/common';
import {CsmRelationshipService} from "../csm-relationship.service";
import {DEFAULT_VIEW, ROW_IDENTIFIER_KEY} from "../csm-relationship.constants";
import { CONTEXT_INFO, ICONTEXT_INFO, StateAction360 } from '@gs/cs360-lib/src/common';
import {NzModalRef, NzModalService} from "@gs/ng-horizon/modal";
import {
  getDefaultRelationshipState,
  getRelationshipTypeFilterCondition
} from "../csm-relationship.utils";
import { PageContext } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { CS360Service } from '@gs/cs360-lib/src/common';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import {getReporting360Ctx} from "../../csm-reports/csm-reports.utils";
import { NzDrawerService, NzDrawerRef } from "@gs/ng-horizon/drawer";

@Directive({
  selector: '[viewHost]'
})
export class RelationshipViewHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'gs-relationship-view',
  templateUrl: './relationship-view.component.html',
  styleUrls: ['./relationship-view.component.scss']
})
export class RelationshipViewComponent implements OnInit {



  @Input() section: any;

  @Input() config: any;

  @Input() relTypes: any;

  @Output() action = new EventEmitter<StateAction360>();

  @ViewChild(RelationshipViewHostDirective, { static: true }) relViewHostRef: RelationshipViewHostDirective;

  @ViewChild('relMiniTitle', {static: false}) relMiniTitle: TemplateRef<any>;
  @ViewChild('relMainTitle', {static: false}) relMainTitle: TemplateRef<any>;

  @ViewChild('relationshipForm', {static: false}) relationshipFormRef: ElementRef;
  @ViewChild('relFormDrawerTemp', {static: true}) relFormDrawerTemp: TemplateRef<any>;

  public componentRef: any;
  showError: boolean = false;

  public filterView = {
    config: {
      filters: ReportFilterUtils.emptyFilters(), // state filter
      readOnlyFilter: ReportFilterUtils.emptyFilters(), // read only filter
      selectedView: DEFAULT_VIEW,
      type: {id: "", name: "",label: ""}
    },
    show: true
  }
  public openDrawer: boolean = false;
  public genericDrawer = {
    componentRef: null,
    title: 'Add Record',
    width: '50rem',
    showReset: false
  }
  modalRef: NzModalRef;
  public loader: boolean = false;
  public actionsPermissionSet = {
    add: true,
    edit: true,
    delete: true
  };
  public customPaginator = {
    recordType: 0,
    pageSizes: [50, 100, 200],
    fromRecord: 0,
    toRecord: 0,
    totalRecords: -1,
    nextPageSize: null,
    currentPageSize: 30,
    nextAvailable: false,
    onDemand: true,
    descriptionText: '360.admin.relationship_form.descText',
    currentPageNum: 1
  };
  public sortInfo: {sort?: string, sortColumn?: any, columns?: any[], show: boolean};
  public preservedSortInfo: any = {};
  public isMini360 = false;
  public disableSave:boolean = false;
  private cs360Filters: ReportFilter;
  private messageId: any;
  public selectedType: string = '';
  public selectedItem: any;
  public selectedItemName: string = '';
  public reportList: any;
  public panels = [
    {
      title: 'TYPES',
      index: 'REL_TYPES',
      name: this.i18nService.translate('360.csm.relationship_filters.type').toUpperCase(),
      disabled: false,
      active: true,
      hidden: false,
      arrow: true,
      data: [],
      originalData: []
    },
    {
      title: 'REPORTS',
      index: 'REPORTS',
      name: this.i18nService.translate('360.csm.relationship_filters.reports').toUpperCase(),
      disabled: false,
      active: true,
      hidden: false,
      arrow: true,
      data: [],
      originalData: []
    }
  ];
  public drawerRef: NzDrawerRef = null;
  public isBreadcrumb: boolean = false;
  public drawerVisible: boolean = false;

  constructor(private cfr: ComponentFactoryResolver,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              @Inject("envService") private _env: EnvironmentService,
              private modalService: NzModalService,
              private message: NzMessageService,
              private csmRelationshipService: CsmRelationshipService,
              private c360Service: CS360Service,
              protected viewContainerRef: ViewContainerRef,
              private i18nService: NzI18nService,
              private drawerService: NzDrawerService,) { }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    const { config, state } = this.section;
    const { reports = [] } = !isEmpty(config) ? config.reportConfig: {};
    this.reportList = reports;

    this.panels = this.panels.map((panel) => {
      if(panel.index === 'REL_TYPES') {
        return {
          ...panel,
          data: this.relTypes,
          originalData: cloneDeep(this.relTypes)
        }
      } else if(panel.index === 'REPORTS') {
        return {
          ...panel,
          data: reports,
          originalData: cloneDeep(reports)
        }
      }

      return panel;
    });
    this.bootstrapComponent();
  }

  private bootstrapComponent() {
    const { state } = this.section;
    if(!isEmpty(state) && !isEmpty(state.state)) {
      const { selectedView = DEFAULT_VIEW, filters = ReportFilterUtils.emptyFilters(), sortInfoByRelTypeId, selectedRelType } = state.state;
      this.filterView.config = {
        ...this.filterView.config,
        selectedView,
        filters
      };
      this.preservedSortInfo = sortInfoByRelTypeId || {};
    }
    // Configure permission set.
    this.updatePermissionSet();

    // selected relType will render Here.

    const { index, item } = this.getDefaultSelectedItem();
    // state call should not be made for the first time load
    this.onItemClick({ index }, item, false);
  }

  getDefaultSelectedItem() {
    const { state } = this.section;
    let item = { index: this.panels[0].index, item: this.panels[0].data[0]};
    if(!isEmpty(state) && !isEmpty(state.state)) {
      const { selectedRelType } = state.state;
      const matchedPanel = this.panels.filter(p => {
        const { index, data } = p;
        return data.some(d => d.id === selectedRelType);
      }).map(p => {
        const { index, data } = p;
        return { index, item: data.find(d => d.id === selectedRelType) };
      });

      return matchedPanel && matchedPanel.length ? matchedPanel[0]: item;
    }

    return item;
  }
    ngOnChanges(changes: SimpleChanges): void {
      if(!isMini360(this.ctx)) {
          if(changes.config.firstChange) return;
          if(!isEmpty(changes.config.currentValue)) {
              const { type, payload } = changes.config.currentValue;
              this.showLoader(true);
              this.changeDataOnitemClick(type, payload);

          }
      }

    }

  onItemClick(panel: any, item: any, saveState) {
      if(!!this.selectedItem && this.selectedItem.id === item.id) return;
      this.showLoader(true);
      this.changeDataOnitemClick(panel.index, item);
      this.action.emit({
          type: panel.index,
          payload: item,
          saveState
      });
  }

  changeDataOnitemClick(panel: any, item: any) {
    if(!!this.selectedItem && this.selectedItem.id === item.id) return;
    this.selectedItem = item;
    this.selectedItemName = item.name === 'All' ? this.i18nService.translate('360.csm.360.all_relationship_types'): item.name;
      switch(panel) {
          case 'REL_TYPES':
              this.hideFilterView(true);
              // Get readOnly filter here
              this.filterView.config = {
                  ...this.filterView.config,
                  readOnlyFilter: item.name !== 'All' ? getRelationshipTypeFilterCondition(item.name): ReportFilterUtils.emptyFilters()
              }
              this.filterView.config = {...this.filterView.config, type: item};
              this.setSortInfo({show: false, ...this.preservedSortInfo[item.id], columns: []});
              this.renderRelationshipTypeView(item);
              break;
          case 'REPORTS':
              this.hideFilterView(false);
              this.filterView.config = {...this.filterView.config, type: item};
              this.renderReportView(item);
              this.showLoader(false);
              break;
      }
  }

  public setSortInfo(sortInfo: {sort?: string, column?: any, columns?: [], show: boolean}) {
    this.sortInfo = sortInfo;
    if(sortInfo.show) {
      if(this.componentRef && this.componentRef.instance && (!this.sortInfo || isEmpty(this.sortInfo.columns))) {
        this.sortInfo.columns = cloneDeep(this.componentRef.instance.getColumnConfig().columns);
        this.sortInfo.sortColumn = this.sortInfo.sortColumn ?
                                    this.sortInfo.columns.find(col => col.itemId === this.sortInfo.sortColumn.itemId) :
                                    this.sortInfo.columns.find(col => col.fieldName === "Name" && !col.fieldPath);
        this.sortInfo.sort = this.sortInfo.sort || "ASC";
      }
    }
    this.config = {...this.config, orderBy: this.sortInfo.sortColumn ? [{...this.sortInfo.sortColumn, orderByInfo: {order: this.sortInfo.sort}}] : null};
  }

  getIsSorted(column) {
    try {
      return this.sortInfo.sortColumn.fieldName === column.fieldName && (this.sortInfo.sortColumn.fieldPath ? isEqual(this.sortInfo.sortColumn.fieldPath, column.fieldPath) : !column.fieldPath);
    } catch{return false}
  }

  public onSortChange(column?: any) {
    if(column) {
      this.sortInfo.sortColumn = column;
    }
    this.config.orderBy = [{...this.sortInfo.sortColumn, orderByInfo: {order: this.sortInfo.sort}}];
    this.action.emit({
      type: 'PRESERVE_STATE',
      payload: { sortInfoByRelTypeId: {...this.preservedSortInfo, [this.filterView.config.type.id]: {sortColumn: this.sortInfo.sortColumn, sort: this.sortInfo.sort}}}
    });
    this.preservedSortInfo = {...this.preservedSortInfo, [this.filterView.config.type.id]: {sortColumn: this.sortInfo.sortColumn, sort: this.sortInfo.sort}};
    this.refreshView();
  }

  private updatePermissionSet() {
    const { settings = [] } = !!this.section.config ? this.section.config: {};
    settings.forEach(s => {
      switch (s.value) {
        case "ALLOW_RELATIONSHIP_CREATE_DELETE":
          this.actionsPermissionSet = {
            ...this.actionsPermissionSet,
            add: s.checked && this.isFullUserLicensed(),
            delete: s.checked && this.isFullUserLicensed()
          }
          break;
        case "ALLOW_RELATIONSHIP_EDIT":
          this.actionsPermissionSet = {
            ...this.actionsPermissionSet,
            edit: s.checked && this.isFullUserLicensed()
          }
          break;
      }
    })
  }

  isFullUserLicensed(): boolean {
    const { userConfig } = this._env.gsObject;
    return !!userConfig.licenseType ? userConfig.licenseType.toUpperCase() === 'FULL': true;
  }

  private renderRelationshipTypeView(config: any) {
    const relationshipTypeViewComponentFactory = this.cfr.resolveComponentFactory(RelationshipTypeViewComponent);
    const viewContainerRef = this.relViewHostRef.viewContainerRef;
    viewContainerRef.clear();
    if(this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.componentRef = viewContainerRef.createComponent(relationshipTypeViewComponentFactory);
    const widgetInstance = this.componentRef.instance as RelationshipTypeViewComponent;
    widgetInstance.view = this.filterView.config.selectedView;
    widgetInstance.type = config;
    widgetInstance.config = {
      ...this.filterView.config,
      orderBy: this.config && this.config.orderBy,
      actionsPermissionSet: this.actionsPermissionSet
    };
    widgetInstance.section = <any>this.section;
    widgetInstance.action.subscribe(evt => {
      const { type, payload } = evt;
      switch (type.toUpperCase()) {
        case 'EDIT':
          this.openDrawer = true;
          this.genericDrawer = {
            ...this.genericDrawer,
            width: '840px',
            title: this.i18nService.translate('360.csm.relationship_view.editRel'),
            showReset: false
          }
          this.drawerRef = this.openRelationshipFormDrawer();
          this.drawerRef.afterOpen.subscribe(() => {
            this.loadRelationshipForm('EDIT', payload);
          })
          break;
        case 'DELETE':
          this.openDeleteRelationshipModal(payload);
          break;
        case 'SHOW_LOADER':
          this.showLoader(payload);
          break;
        case 'COLUMNS_SET':
          if(this.filterView.config.selectedView === "CARD") {
            this.setSortInfo({show: this.filterView.config.selectedView === "CARD", ...this.preservedSortInfo[this.filterView.config.type.id], columns: []});
          }
          break;
        case 'STATE_PRESERVE_COLS':
          this.action.emit({
            type: 'STATE_PRESERVE_COLS',
            payload: {
              selectedRelType: this.filterView.config.type.id === 'ALL'? 'default': this.filterView.config.type.id,
              columnsState: { [this.filterView.config.type.id]: payload }
            }
          })
          break;
      }
    })
  }

  // /**
  //  * Load Report View dynamically
  //  * @private
  //  */
  private async renderReportView(config: any) {
    // Get Company Filters
    this.cs360Filters = await this.getCs360Filters();
    const reportWidgetElementComponentFactory = this.cfr.resolveComponentFactory(ReportWidgetCs360ElementLoader);
    const viewContainerRef = this.relViewHostRef.viewContainerRef;
    viewContainerRef.clear();
    if(this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.componentRef = viewContainerRef.createComponent(reportWidgetElementComponentFactory);
    const widgetInstance = this.componentRef.instance as any;
    widgetInstance.id = isMini360(this.ctx)? MiniPrefix+`w_${config.id}`:`w_${config.id}`; // widget id
    widgetInstance.properties = this.getProperties(config);
    widgetInstance.cs360Filters = { whereAdvanceFilter : this.cs360Filters, havingAdvanceFilter: ReportFilterUtils.emptyFilters() };
    widgetInstance.showActionColumn = false;
    widgetInstance.showAddRecordButton = false;
    widgetInstance.includeId = false;
    widgetInstance.dataFromChildrenOptions = {show: false};
    widgetInstance.disableFilterModification = false;
    widgetInstance.useCache = false;
    this.componentRef.changeDetectorRef.detectChanges();
  }

  private getProperties(report?: any) {
    return {
      name: report.name,
      referenceId: report.id,
      context: {
        layoutId: this.section.layoutId,
        loadWidgetData: true,
        requestSource: "C360",
        globalFilterAlias: this.ctx.pageContext === PageContext.C360 ? this.i18nService.translate('360.csm.relationship_view.company'): this.i18nService.translate('360.csm.relationship_view.relationship') +' '+ this.i18nService.translate('360.csm.relationship_view.filter'),
        exportsPayloadKey: "c360ReportDataRequestDTO",
        ...getReporting360Ctx(this.ctx)
      }
    }
  }

  private async getCs360Filters(): Promise<ReportFilter> {
    if(!this.cs360Filters) {
      const payload: ReportFilter = await this.constructFilterPayload();
      return !isEmpty(payload) ? payload: {};
    } else {
      return new Promise(res => res(this.cs360Filters));
    }
  }

  private constructFilterPayload(): Promise<ReportFilter> {
    const { reportConfig } = this.section.config;
    const payload = this.constructFilterPayloadByHostType('MDA', reportConfig.filter);
    return this.csmRelationshipService.getCompanyFilters(payload);
  }

  private constructFilterPayloadByHostType(type: string, filterField: any) {
    const companyId = this.ctx.cId;
    switch (type) {
      case 'MDA':
        return {
          objectType: type,
          companyId,
          showChildren: false,
          filter: {
            additionalFilters: filterField
          }
        }
        break;
      case 'SFDC':
        return {
          connectionId: null,
          objectType: type,
          companyId,
          showChildren: false,
          filter: {
            additionalFilters: filterField
          }
        }
        break;
    }
  }

  private hideFilterView(show: boolean): void {
    this.filterView = {...this.filterView, show};
  }

  public onSwitchChange(selectedView: string) {
    console.log(selectedView);
    this.filterView.config = {...this.filterView.config, selectedView};
    this.componentRef.instance.updateView(selectedView);
    this.setSortInfo({show: selectedView === "CARD", ...this.preservedSortInfo[this.filterView.config.type.id], columns: []});
    // Clear the name filter on view switch.
    // this.filterView.config.searchTerm.setValue('', {emitEvent: false});
    this.action.emit({
      type: 'PRESERVE_STATE',
      payload: { selectedView }
    })
  }


  openRelationshipFormDrawer() {
    return this.drawerRef ? this.drawerRef: this.drawerService.create({
      nzTitle: this.isMini360 ? this.relMiniTitle : this.relMainTitle,
      nzContent: this.relFormDrawerTemp,
      nzMaskClosable: true,
      nzPlacement: 'right',
      nzWrapClassName: 'gs-csm-relationship-drawer',
      nzWidth:this.genericDrawer && this.genericDrawer.width,
      nzOnCancel: (): Promise<boolean> => {
        this.drawerRef = null;
        return Promise.resolve(true);
      },
    });
  }

  public onAction(type: string, event?: MouseEvent | TouchEvent) {
    switch (type) {
      case 'OPEN_FILTER':
          if (!this.isMini360) {
              this.openDrawer = true;
              this.genericDrawer = {
                  ...this.genericDrawer,
                  width: '90rem',
                  title: this.i18nService.translate('360.csm.relationship_view.addFilter'),
                  showReset: true
              }
              this.drawerRef = this.openRelationshipFormDrawer();
              this.drawerRef.afterOpen.subscribe(() => {
                this.loadRelationshipFilters();
              })
          } else {
            this.loadRelationshipFiltersForMini();
          }

        break;
      case 'ADD_REL':
        this.isBreadcrumb = true;
        this.openDrawer = true;
          this.genericDrawer = {
          ...this.genericDrawer,
          width: '840px',
          title: this.i18nService.translate('360.csm.relationship_view.addRel'),
          showReset: false
        }
        this.drawerRef = this.openRelationshipFormDrawer();
        this.drawerRef.afterOpen.subscribe(() => {
          this.loadRelationshipForm('ADD', {});
        })
        break;
      case 'EDIT_REL':
        this.openDrawer = true;
        this.genericDrawer = {
          ...this.genericDrawer,
          width: '840px',
          title: this.i18nService.translate('360.csm.relationship_view.editRel'),
          showReset: false
        }
        this.drawerRef.afterOpen.subscribe(() => {
          this.loadRelationshipForm('EDIT', {});
        })
        break;
      case 'DELETE_REL':
        break;
      case 'RESET_STATE':
        const defaultState = getDefaultRelationshipState();
        this.filterView.config = {
          ...this.filterView.config,
          filters: defaultState.filters
        };
        this.refreshView();
        this.action.emit({
          type: 'PRESERVE_STATE',
          payload: { filters: defaultState.filters }
        });
        break;
      case 'REFRESH_VIEW':
        this.refreshView();
        break;
      default: null
    }
  }

  public onDrawerAction(type: string, componentInstance?) {
    switch (type) {
      case 'SAVE':
        // if(this.genericDrawer.componentRef) {
          console.log('onstance', componentInstance)
          const data: StateAction = componentInstance ? componentInstance.serialize() : this.genericDrawer.componentRef && this.genericDrawer.componentRef.instance.serialize();
          switch (data.type) {
            case 'SAVE_FILTERS':
              if(!!data.payload && data.payload.error) {
                this.showError = true;
              } else {
                this.filterView.config = { ...this.filterView.config, filters: this.processFilters(data.payload) };
                this.showError = false;
                this.refreshView();
                if(this.isMini360) {
                  componentInstance.filters = data.payload;
                }
                this.action.emit({
                  type: 'PRESERVE_STATE',
                  payload: { filters: data.payload }
                });
                this.onDrawerClose();
              }
              break;
            case 'SAVE_RELATIONSHIP':
              if(!!data.payload && data.payload.error) {
                this.showError = true;
              } else {
                this.saveRelationship(data.payload);
                this.showError = false;
                this.onDrawerClose();
              }
              break;
          }
        // }
        break;
      case 'CANCEL':
        this.onDrawerClose();
        break;
      case 'RESET':
        this.onAction('RESET_STATE');
        this.onDrawerClose();
        break;
    }
  }

  // /**
  //  * This sorcery has been done due to contract mismatch between reporting and core filters.
  //  * @param filters
  //  * private
  //  */
  private processFilters(filters: ReportFilter) {
    filters.conditions = filters.conditions.map(c => {
      if(c.filterValue) {
        c.filterValue["includeNulls"] = c.includeNulls;
      }
      return c;
    });
    return filters;
  }

  private constructPayload() {
    const { currentPageSize, currentPageNum } = this.customPaginator;
    const newColumns = this.componentRef.instance.getColumnConfig().allColumns.concat([{
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
      ...this.componentRef.instance.getColumnConfig(),
      columns: newColumns,
      limit: currentPageSize,
      offset: (currentPageNum - 1) * currentPageSize
    };
  }

  private async loadRelationshipFilters() {
    let fields: any[] = [];
    if(this.componentRef.instance) {
      // Always get the ALL relationship column config.
      fields = await this.csmRelationshipService.getFilterFieldsFromDefaultConfig();
    }
    const { filters, readOnlyFilter } = this.filterView.config;
    const relationshipFilterViewComponentFactory = this.cfr.resolveComponentFactory(RelationshipFilterViewComponent);
    const viewContainerRef = this.viewContainerRef;
    viewContainerRef.clear();
    if(this.genericDrawer.componentRef) {
      this.genericDrawer.componentRef.destroy();
      this.genericDrawer.componentRef = null;
    }
    this.genericDrawer.componentRef = viewContainerRef.createComponent(relationshipFilterViewComponentFactory);
    const widgetInstance = this.genericDrawer.componentRef.instance as any;
    widgetInstance.allowedFields = fields.map(f => {
      const {fieldName, dataType, fieldPath, label, objectName} = f;
      return {fieldName, dataType, fieldPath, label, objectName};
    });
    widgetInstance.filters = filters;
    widgetInstance.readOnlyFilter = readOnlyFilter;
    this.genericDrawer.componentRef.changeDetectorRef.detectChanges();
    widgetInstance.element = this.genericDrawer.componentRef.location.nativeElement;
    this.relationshipFormRef.nativeElement.appendChild(widgetInstance.element);
  }

  // This will load modal component for mini 360 filters
  private async loadRelationshipFiltersForMini() {
        let fields: any[] = [];
        const { filters, readOnlyFilter } = this.filterView.config;
          fields = await this.csmRelationshipService.getFilterFieldsFromDefaultConfig();
          const allowedFields = fields.map(f => {
              const {fieldName, dataType, fieldPath, label, objectName} = f;
              return {fieldName, dataType, fieldPath, label, objectName};
          });
        this.modalRef = this.modalService.create({
            nzTitle: this.i18nService.translate('360.csm.relationship_view.addFilter'),
            nzClassName: 'rel-filter-modal',
            nzWidth: 820,
            nzContent: RelationshipFilterViewComponent,
            nzFooter: [
                {
                    label: this.i18nService.translate('360.csm.relationship_view.reset'),
                    shape: "round",
                    onClick: () => this.onDrawerAction('RESET')
                },
                {
                    label: this.i18nService.translate('360.csm.relationship_view.cancel'),
                    shape: "round",
                    onClick: () => this.onDrawerAction('CANCEL'),

                },
                {
                    label: this.i18nService.translate('360.csm.relationship_view.save'),
                    type: "primary",
                    shape: "round",
                    onClick: (contentComponentInstance) => this.onDrawerAction('SAVE', contentComponentInstance)
                }
            ],
            nzComponentParams: {filters, readOnlyFilter, allowedFields}
        })
        const widgetInstance = this.modalRef.getInstance() as any;
        widgetInstance.allowedFields = fields.map(f => {
            const {fieldName, dataType, fieldPath, label, objectName} = f;
            return {fieldName, dataType, fieldPath, label, objectName};
        });
        widgetInstance.filters = filters;
        widgetInstance.readOnlyFilter = readOnlyFilter;
    }

  private updateWidgetInstance(mode, fields, config){
    const relationshipFormComponentFactory = this.cfr.resolveComponentFactory(RelationshipFormComponent);
    this.viewContainerRef.clear();
    if(this.genericDrawer.componentRef) {
      this.genericDrawer.componentRef.destroy();
      this.genericDrawer.componentRef = null;
    }
    this.genericDrawer.componentRef = this.viewContainerRef.createComponent(relationshipFormComponentFactory);
    window.addEventListener('REL_TYPE_CHANGED', this.disableSaveBtn.bind(this));
    const widgetInstance = this.genericDrawer.componentRef.instance as RelationshipFormComponent | any;
    widgetInstance.mode = mode;
    widgetInstance.fields = mode === 'EDIT' ? fields: [];
    widgetInstance.config = mode === 'EDIT' ? { type: this.filterView.config.type, data: config }: {};
    widgetInstance.action.subscribe(data => {
      const { type, payload } = data;
      switch (type){
        case 'CANCEL':
          this.onDrawerClose();
          break;
      }
    })
    this.genericDrawer.componentRef.changeDetectorRef.detectChanges();
    widgetInstance.element = this.genericDrawer.componentRef.location.nativeElement;
    this.relationshipFormRef.nativeElement.appendChild(widgetInstance.element);
  }

    @HostListener('document:REL_TYPE_CHANGED', ['$event'])
    disableSaveBtn(event) {
        this.disableSave = event.detail.showBannner;
    }

  private loadRelationshipForm(mode: string, config?: any): void {
    let fields: any[];
    let data: any ;
    let key: any;
    if(this.componentRef.instance) {
      if(mode === 'EDIT'){
        key = config.rowIdentifierGSID.fv || config.rowIdentifierGSID.v
        fields = this.componentRef.instance.getColumnConfig().allColumns;
      } else {
        fields = this.componentRef.instance.getColumnConfig().columns;
      }
    }
    if(mode === 'EDIT'){
      this.customPaginator = this.csmRelationshipService.customPaginatorData;
      var payload = this.constructPayload();
      payload.orderBy = null;
      this.csmRelationshipService.
        fetchRelationshipsListViewData(payload).
          subscribe((list: any) => {
            data = list.data.length >= 1 ? this.getCompareKey(list.data, key) : [];
            if(data) {
              this.updateWidgetInstance(mode, fields, data);
            }
          });
      } else {
          data = config;
          this.updateWidgetInstance(mode, fields, data);
      }
  }

  private getCompareKey(data, key){
    for(let obj of data){
      if(obj.rowIdentifierGSID.k  === key){
         return obj
      }
    }
  }

  //360.csm.relationship_view.addingRel = Adding relationship...
  //360.csm.relationship_view.editingRel = Editing relationship...
  //360.csm.relationship_view.relAddSuccess = Relationship edited successfully.
  //360.csm.relationship_view.relAddFailure = Unable to edit Relationship. Please try again.

  private saveRelationship(payload: any): void {
    const { mode, data } = payload;
    if(mode === "ADD") {
      this.messageId = this.message.loading(this.i18nService.translate('360.csm.relationship_view.addingRel'), {nzDuration: 0}).messageId;
      this.csmRelationshipService
          .saveRelationship({ records: [data] })
          .subscribe((data) => {
            if(!!data && data.count === 1) {
              // Refresh the view and show toaster.
              this.refreshView();
              this.message.remove(this.messageId);
              this.message.success(this.i18nService.translate('360.csm.relationship_view.addSuccess'), {nzDuration: 2000});
            } else {
              this.message.remove(this.messageId);
              this.message.error(this.i18nService.translate('360.csm.relationship_view.addFailure'), {nzDuration: 2000});
            }
          });
    } else if(mode === "EDIT") {
      this.messageId = this.message.loading(this.i18nService.translate('360.csm.relationship_view.editingRel'), {nzDuration: 0}).messageId;
      this.csmRelationshipService
          .updateRelationship({ records: [data] })
          .subscribe((data) => {
            if(!!data && data.count === 1) {
              // Refresh the view and show toaster.
              this.refreshView();
              this.message.remove(this.messageId);
              this.message.success(this.i18nService.translate('360.csm.relationship_view.relAddSuccess'), {nzDuration: 2000});
            } else {
              this.message.remove(this.messageId);
              this.message.error(this.i18nService.translate('360.csm.relationship_view.relAddFailure'), {nzDuration: 2000});
            }
          });
    }
  }

  private openDeleteRelationshipModal(payload: any): void {
      this.modalService.confirm({
      nzTitle: this.i18nService.translate('360.csm.relationship_view.deleteModalTitle'),
      nzContent: this.i18nService.translate('360.csm.relationship_view.deleteModalContent'),
      nzOnOk: () => {
        this.deleteRelationship(payload);
      },
      nzOkText: this.i18nService.translate('360.admin.common_layout.deleteModalOk')
    });
  }

  private deleteRelationship(payload: any) {
    console.log(payload);
    const relId = !!payload && !isEmpty(payload[ROW_IDENTIFIER_KEY]) ? payload[ROW_IDENTIFIER_KEY].v: null;
    if(!!relId) {
      this.csmRelationshipService
          .deleteRelationship(relId)
          .subscribe((data) => {
            // Refresh the view and show toaster.
            this.refreshView();
            this.openToastMessageBar({
              message: this.i18nService.translate('360.csm.relationship_view.successMsg'),
              action: null,
              messageType: MessageType.SUCCESS
            });
          })
    } else {
      // cannot perform delete operation.
      this.openToastMessageBar({message: this.i18nService.translate('360.csm.relationship_view.errorMsg'), action: null, messageType: MessageType.ERROR});
    }
  }

  refreshView() {
    if(this.componentRef.instance) {
      this.componentRef.instance.updateFiltersAndSort({...this.filterView.config, orderBy: this.config.orderBy});
    }
  }
  @HostListener('window:LAUNCH_MINI_360')
  public onDrawerClose() {
    this.openDrawer = false;
    this.showError = false;
    if(this.genericDrawer.componentRef) {
      this.genericDrawer.componentRef.destroy();
      this.genericDrawer.componentRef = null;
    }
    if(this.modalRef) {
      this.modalRef.destroy();
    }
    if(this.drawerRef) {
      this.drawerRef.close();
      this.drawerRef = null;
    }
  }

  private showLoader(flag: boolean): void {
    this.loader = flag;
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

    onCompanyClick() {
      const customEvent = new CustomEvent('LAUNCH_MINI_360', {});
      window.dispatchEvent(customEvent);
    }

}
