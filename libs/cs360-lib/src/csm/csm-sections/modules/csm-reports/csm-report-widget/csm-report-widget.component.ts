import {
  Component,
  ComponentFactoryResolver,
  ElementRef, EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { cloneDeep, isEmpty, get} from 'lodash';
import {NzResizeEvent} from "@gs/ng-horizon/resizable";
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { ReportFilterUtils } from "@gs/report/utils";
import { ReportFilter } from "@gs/report/pojos";
import { GSEventBusService, GSEvents, StateAction } from "@gs/gdk/core";
import {isObjectTransactional,getReporting360Ctx} from "../csm-reports.utils";
import {IReportGroup} from "@gs/report/reports-configuration/report-grouper/report-grouper";
import {CsmReportsService} from "../csm-reports.service";
import {ICONTEXT_INFO, IGroupState, MiniPrefix} from '@gs/cs360-lib/src/common';
import { GdmObjectFormWidgetCs360ElementLoader } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO ,PageContext ,ReportWidgetCs360ElementLoader } from '@gs/cs360-lib/src/common';

// RxJS
import { take, tap } from 'rxjs/operators';

// Horizon
import { NzModalService } from '@gs/ng-horizon/modal';

// Components
import { RecordTypeSelectionModalComponent } from './record-type-selection-modal.component';

// Utils
import { getCreateRecordUrl_lightning, getCreateRecordUrl_classic } from '../csm-reports.utils';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { csmReportWidgetConfig } from './csm-report-widget.config';


@Component({
  selector: 'gs-csm-report-widget',
  templateUrl: './csm-report-widget.component.html',
  styleUrls: ['./csm-report-widget.component.scss']
})
export class CsmReportWidgetComponent implements OnInit {

  @Input() group: IReportGroup;

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild("reportHostElemRef", { static: true }) reportHostElementRef: ElementRef;

  @ViewChild("gdmObjectFormHostElemRef", { static: true }) gdmObjectFormHostElemRef: ElementRef;

  public selectedReport: any;

  public componentRef: any = null;

  public openDrawer: boolean = false;

  public gdmObjectFormComponentRef: any = null;

  protected cs360Filters: ReportFilter;

  public RESIZER_VALUES = {
    id: null,
    width: 260,
    resizer_class: '',
    minWidth: 80,
    maxWidth: 300,
    dragging: false,
    inactive_class: '',
    active_class: 'dragging'
  };

  protected loading: boolean = false;
  public spinnerLoading: boolean = false;
  public renderReport: boolean = true;
  public error = {
    show: false,
    message: null,
    code: null
  };
  public isMini360Variant : boolean = false;
  public seletedReportTab: number = 0;

  constructor(protected cfr: ComponentFactoryResolver,
              protected env: EnvironmentService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              protected csmReportsService: CsmReportsService,
              protected viewContainerRef: ViewContainerRef,
              protected modalService: NzModalService,
              protected eventService: GSEventBusService,
              protected i18nService: NzI18nService) { }

  async ngOnInit() {
    const { state = {} } = this.group;
    this.setMini360Configs();
    if(isEmpty(this.selectedReport)) {
      // Select first report as selected if nothing is selected.
      this.updateSelectedReport();
    }
    // Construct the filters once
    const showChildren: boolean = !!state && state.showDataFromChildren ? true: false;
    this.cs360Filters = await this.getCs360Filter(showChildren);
    // Load the report dynamically
    this.loadReports(this.selectedReport);
  }

  setMini360Configs(){
    this.isMini360Variant = isMini360(this.ctx);
    if(this.isMini360Variant){
      this.RESIZER_VALUES.width = 200;
    }
  }

  updateSelectedReport() {
    this.selectedReport = this.getDefaultSelectedReport();
  }
  
  getDefaultSelectedReport(): any {
    const { state } = this.group;
    if(!!state.selectedReportId) {
      //const stateSelectReport = this.group.reports.find(r => r.reportId === state.selectedReportId);
      const stateSelectedReportIdx : number =  this.group.reports.findIndex(r => r.reportId === state.selectedReportId);
      this.seletedReportTab = stateSelectedReportIdx > -1 ? stateSelectedReportIdx : 0;
      return stateSelectedReportIdx > -1 ? this.group.reports[stateSelectedReportIdx]: this.group.reports[0];
    } else {
      return this.group.reports[0];
    }
  }

  selectReport($event: MouseEvent | TouchEvent, report: any) {
    $event && $event.stopPropagation();
    if(this.loading) return;
    // Donot load the reports when same report is being click repeatedly.
    if(this.selectedReport.reportId !== report.reportId) {
      this.selectedReport = report;
      this.loadReports(report);
      // Preserve select reports
      this.preserveState({selectedReportId: this.selectedReport.reportId});
    }
  }
  reportTabChange(evt ){
    this.seletedReportTab = evt.index;
  }

  loadGdmObjectForm(mode="ADD", gsid="") {
    this.loading = true;
    const { collectionDetails: { objectName = '' } = {} } = this.group;
    const gdmObjectFormWidgetElementComponentFactory = this.cfr.resolveComponentFactory(GdmObjectFormWidgetCs360ElementLoader);

    if(this.gdmObjectFormComponentRef) {
      this.gdmObjectFormComponentRef.destroy();
      this.gdmObjectFormComponentRef = null;
    }

    this.gdmObjectFormComponentRef = this.viewContainerRef.createComponent(gdmObjectFormWidgetElementComponentFactory);

    const gdmObjectFormInstance = this.gdmObjectFormComponentRef.instance as any;
    gdmObjectFormInstance.objectName = objectName;
    gdmObjectFormInstance.mode = mode;
    gdmObjectFormInstance.gsid = gsid;
    gdmObjectFormInstance.drawerEnabled = true;
    gdmObjectFormInstance.changes.subscribe((event: any) => {
      // This events will come from form-builder.component.ts ( repo: gs-ui-platform, module: gdm-object-form )
      const { type } = event;
      switch (type) {
        case "RECORD_ADDED":
        case "RECORD_EDITED":
          (<ReportWidgetCs360ElementLoader>this.componentRef.instance).refreshData();
          break;
        case "FORM_CANCELED":
          break;
        case "GDM_OBJECT_FORM_RENDERED":
          this.loading = false;
          break;
        default: null
      }
    });
    this.gdmObjectFormComponentRef.changeDetectorRef.detectChanges();
    gdmObjectFormInstance.element = this.gdmObjectFormComponentRef.location.nativeElement;
    this.gdmObjectFormHostElemRef.nativeElement.appendChild(gdmObjectFormInstance.element);
  }

  loadReports(report: any) {
    this.loading = true;
    const { id } = this.group;
    const csmReportWidgetElementComponentFactory = this.cfr.resolveComponentFactory(ReportWidgetCs360ElementLoader);
    this.viewContainerRef.clear();
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.componentRef = this.viewContainerRef.createComponent(csmReportWidgetElementComponentFactory);
    const widgetInstance = this.componentRef.instance as any;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).id = isMini360(this.ctx)? MiniPrefix+id : id;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).properties = this.getProperties(report);
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).cs360Filters = { whereAdvanceFilter : this.cs360Filters, havingAdvanceFilter: ReportFilterUtils.emptyFilters() };
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).showActionColumn = this.showActionColumn(this.group);
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).showAddRecordButton = this.showAddRecordButton(this.group);
    // TODO: Need to check the condition for includeId
    // (<ReportWidgetCs360ElementLoader>this.componentRef.instance).includeId = this.includeIdField(this.group);
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).includeId = true;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).dataFromChildrenOptions = this.getDataFromChildrenOptions();
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).disableFilterModification = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).kpiCardViewEnabled = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).useCache = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).honorPadding = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).changes.subscribe((event: any) => {
      // Exposed it to GDM for consumption
      const { type, urls } = event;
      switch (type) {
        case "ON_ACTION_CLICK":
          this.handleAction(event);
          break;
        case "ADD_RECORD":
          this.openDrawer = true;
          this.handleAddRecord(urls || {});
          break;
        case "DATA_FROM_CHILDREN":
          const value = event.event.hasOwnProperty('event')? event.event.event: event.event;
          this.getChildrenAccountData(value);
          break;
        case "WIDGET_RENDERED":
          // Disabled report selection area.
          this.loading = false;
          break;
        default: null
      }
    });
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).extraQueryParams = this.getExtraQueryParams();
    this.componentRef.changeDetectorRef.detectChanges();
    widgetInstance.element = this.componentRef.location.nativeElement;
    this.reportHostElementRef.nativeElement.appendChild(widgetInstance.element);
  }

  getExtraQueryParams() {
    let extraQueryParams = {};
    const { collectionDetails } = this.group;
    const type: string = !isEmpty(collectionDetails) ? collectionDetails.connectionType.toUpperCase(): null;
    //if(this.ctx.pageContext === PageContext.C360) {
      if(type === 'MDA') {
        extraQueryParams['entityId'] = csmReportWidgetConfig[this.ctx.pageContext].mdaEntityId;
      } else {
        extraQueryParams['entityId'] = csmReportWidgetConfig[this.ctx.pageContext].sfdcEntityId;
      }
    // } else {
    //   extraQueryParams['entityId'] = this.ctx.rId;
    // }
    return extraQueryParams;
  }

  handleAddRecord(customUrls?: {}) {
    const { collectionDetails: { connectionType } } = this.group;

    this.proceedToLoadObjectForm(connectionType, 'ADD', '', customUrls);
  }

  handleAction(event) {
    const { payload: { action = {}, rowData = {} } } = event;
    const { GSReportingRowIdentifier : { fv: recordId = "" } = {} } = rowData;
    const { collectionDetails: { connectionType } } = this.group;
    const actionType = action.id; // 'actionType' can be PREVIEW | EDIT

    this.proceedToLoadObjectForm(connectionType, actionType, recordId);
  }


  proceedToLoadObjectForm(connectionType= '', actionType = '', recordId = '', customUrls?) {
    if(connectionType === "MDA") {
      // connectionType === "MDA", then load the form in sidebar
      // If report created using gainsight object, then open the object form in side bar
      // recordId => In this case, since the report is created using gainsight object 'recordId' will be gsid
      this.loadGdmObjectForm(actionType, recordId);
    } else {
      // If report created using salesforce object(eg: Opportunity), then generate salesforce url to navigate to add page.
      // recordId => In this case, since the report is created using salesforce object 'recordId' will be sfdcId
      this.loadSFDCObjectForm(actionType, recordId, customUrls);
    }
  }

  loadSFDCObjectForm(mode, sfdcId, customUrls?) {
    switch(mode) {
      case 'EDIT':
        this.navigateToSFDCPage(`${sfdcId}/e?`, true, false);
        break;
      case 'PREVIEW':
        this.navigateToSFDCPage(sfdcId, true, false);
        break;
      case 'ADD':
        this.loadSFDCAddForm(mode, customUrls);
        break;  
    }
  }

  loadSFDCAddForm(mode, customUrls?) {
    const { objectName = '' } = this.group.collectionDetails || {};

    // accountRef => Company Reference that is set when configuring C360 Layout Report.
    const { fieldName: accountRef = '' } = this.group.additionalFilters && this.group.additionalFilters[0] || {};

    // Need some additional values to generate the create record url
    // To get the values, we are making api call to '/api/describe'.
    // 1. objectId => 'keyPrefix' from describe api call.
    // 2. actualObjectId => 'objectId' in describe api call
    // 3. isStandardObject => 'objectType' === 'standard'
    // 4. recordTypeIds => find the field which have 'fieldName' === 'RecordTypeId' and get the options (from describe only)
    // 5. fieldId => fieldId of accountRef field

    this.spinnerLoading = true;

    this.csmReportsService.fetchAdditionalUrlCreationResources(objectName, accountRef).pipe(
      tap((additionalUrlCreationResources) => {

        this.spinnerLoading = false;
        const { collectionDetails } = this.group;
        let customUrl = customUrls && (customUrls[objectName+'_'+collectionDetails.connectionId] || customUrls['all_objects_'+collectionDetails.connectionId]);
        if(!customUrl) {
          if (HybridHelper.isLightningEnabled()) {
            // In Lightning mode, user has to select record type before navigating to add record page.
            // whereas in classic mode, post navigation user will select the record type.
            this.handleSFDCLightningForm(objectName, accountRef, mode, additionalUrlCreationResources);
          } else {
            // classic mode
            let createRecordUrl = this.getCreateRecordUrlForClassic(objectName, additionalUrlCreationResources);
            // This is implemented as part of GE-109232, ask from vmware to pass GS relationship id(GSID) as part of query param
            createRecordUrl = this.GS.relationshipId ? createRecordUrl + '&rid=' + this.GS.relationshipId : createRecordUrl;
            this.navigateToSFDCPage(createRecordUrl, true);
          }
        } else {
          const { objectId = '' } = additionalUrlCreationResources || {};
          customUrl = customUrl.replace('{$accountId}', this.GS.accountId).replace('{$objectId}', objectId);
          HybridHelper.navigateToURL(customUrl, true, {isSubTab: true, isLightningLinkRequired: false});
        }
      }),
          take(1)
      ).subscribe();
  }

  getCreateRecordUrlForClassic(objectName, additionalUrlCreationResources) {
    const { objectId = '', actualObjectId = '', isStandardObject = false, recordTypeIds = [], fieldId = '' } = additionalUrlCreationResources || {};
    const url = getCreateRecordUrl_classic({
      objectId,
      objectName,
      keyPrefix: objectId,
      actualObjectId,
      isStandardObject,
      hasRecordTypes: recordTypeIds.length !== 0,
      data: [{
          value: this.GS.accountId,
          fieldId: isStandardObject ? "accId" : fieldId,
          label: window["encodeURIComponent"](this.GS.customerName)
      }],
    });
    return url;
  }

  handleSFDCLightningForm(objectName = '', accountRef = '', mode = '', additionalUrlCreationResources: any) {
    const { recordTypeIds = [] } = additionalUrlCreationResources || {};
    // In case of lightning, the user can select the record type id from 'recordTypeIds'.
    if (recordTypeIds.length <= 1) {
      // If only one record type present in 'recordTypeIds',then use it.
      // If no record type present in 'recordTypeIds', then set 'selectedRecordType' as null.
      const selectedRecordType = recordTypeIds.length === 1  ? recordTypeIds[0].value : null;
      const createRecordUrl = this.getCreateRecordUrlForLighning(objectName, accountRef, mode, selectedRecordType, additionalUrlCreationResources);
      this.navigateToSFDCPage(createRecordUrl, true);
      return;
    }

    // If more than one record type present in 'recordTypeIds', then let the user select.
    this.modalService.create({
      nzTitle: 'Please select record type',
      nzContent: RecordTypeSelectionModalComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        recordTypeIds
      },
      nzClosable: false,
      nzOnOk: ({selectedRecordType = ''}) => {
        const createRecordUrl = this.getCreateRecordUrlForLighning(objectName, accountRef, mode, selectedRecordType, additionalUrlCreationResources);
        this.navigateToSFDCPage(createRecordUrl, true);
      },
      nzOkText: this.i18nService.translate('360.admin.common_layout.deleteModalOk')
    });  
  }


  getCreateRecordUrlForLighning(objectName = '', accountRef = '', mode = '', selectedRecordType = '', additionalUrlCreationResources) {
    const url = getCreateRecordUrl_lightning({
      sObject: objectName,
      accountLookupField: additionalUrlCreationResources.accountLookupFieldName,
      recordTypeId: selectedRecordType,
      accId: this.GS.accountId,
      operation: mode,
      GS: this.GS
    });

    return url;
  }

  get GS() {
    return this.env.gsObject;
  }

  async navigateToSFDCPage(url, isSubTab?, isLightningLinkRequired = true) {
    if(!url) {
      return;
    }

    const isInConsole = await HybridHelper.isInConsole();

    // Lightning
    if(!isInConsole && HybridHelper.isLightningEnabled()) {
      let _temp = ("/"+url).replace("//","/");
      HybridHelper.navigateToURL(_temp, true, {isLightningLinkRequired});
      return;
    }
    url= `${this.GS.sfDomainURL || window.location.origin}/${url}`;
    if (isInConsole || HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, true, {isSubTab, isLightningLinkRequired});
    } else {
      window.open(url, '_blank');
    }
  }

  getProperties(report: any) {
    return {
      name: report.reportName,
      referenceId: report.reportId,
      context: {
        layoutId: this.group.properties && this.group.properties.layoutId,
        ...csmReportWidgetConfig[this.ctx.pageContext].context,
        ...getReporting360Ctx(this.ctx)
      }
    }
  }


  onResize({ width}: NzResizeEvent) {
    cancelAnimationFrame(this.RESIZER_VALUES.id);
    this.RESIZER_VALUES.id = requestAnimationFrame(() => {
      width = Math.min(width, this.RESIZER_VALUES.maxWidth);
      width = Math.max(width, this.RESIZER_VALUES.minWidth);
      this.RESIZER_VALUES.width = width;
    });
    const payload = {
      type: GSEvents.GRIDSTERRESIZE,
      sourceId: this.group.id,
      payload: {}
    };
    this.eventService.emit(payload);
  }

  // Get Company or Relationship or Person filter for reports.
  async getCs360Filter(showChildren: boolean = false): Promise<any> {
    const { collectionDetails } = this.group;
    const type: string = !isEmpty(collectionDetails) ? collectionDetails.connectionType.toUpperCase(): null;
    const payload = await this.constructFilterPayloadByHostType(type, showChildren);
    //for p360 addition filters will be there for person reference and relationship reference
    if(this.ctx.pageContext === PageContext.P360){
      return this.fetchPersonFilter(payload);
    }
    return this.fetchCompanyOrAccountFilter(payload);
  }

  fetchCompanyOrAccountFilter(payload: any): Promise<ReportFilter> {
    return this.csmReportsService.getCompanyFilters(payload);
  }

  fetchPersonFilter(payload: any): Promise<ReportFilter> {
    const additionalFilters = cloneDeep(payload.filter.additionalFilters);
    payload.filter.additionalFilters = [];
    switch(this.ctx.associatedContext){
      case PageContext.C360 :
        payload = {...payload,
          companyId : this.ctx.cId}
        payload.filter.additionalFilters.push(additionalFilters.filter(filterItem => filterItem.properties.isP360CompanyFilter)[0]);
        break;
      case PageContext.R360 :
        payload = {...payload,
          relationshipId : this.ctx.rId
        }
        payload.filter.additionalFilters.push(additionalFilters.filter(filterItem => filterItem.properties.isP360RelationshipFilter)[0]);
        break;
    }
    payload = {...payload,
      personId : this.ctx.pId}
    payload.filter.additionalFilters.push(additionalFilters.filter(filterItem => filterItem.properties.isP360PersonFilter)[0]);
    return this.csmReportsService.getPersonFilters(payload);
  }
  //ToDo:remove dummyfunction after semantic release
  dummyFunction(){

  }

  async constructFilterPayloadByHostType(type: string, showChildren: boolean = false) {
    const { additionalFilters = [], collectionDetails } = this.group;
    const { companyId = this.ctx.cId } = this.env.gsObject;
    switch (type) {
      case 'MDA':
        return {
          objectType: type,
          objectLabel: collectionDetails.objectLabel,
          companyId: companyId || this.ctx.cId,
          showChildren,
          filter: {
            additionalFilters: additionalFilters
          }
        }
        break;
      case 'SFDC':
        return {
          connectionId: collectionDetails.connectionId,
          objectType: type,
          objectLabel: collectionDetails.objectLabel,
          companyId: companyId || this.ctx.cId,
          showChildren,
          filter: {
            additionalFilters: additionalFilters
          }
        }
        break;
    }
  }

  getDataFromChildrenOptions(): any {
    const { state } = this.group;
    return {show: this.isAccountHierarchyEnabled(), value: state.showDataFromChildren};
  }

  /**
   * This method will be called on click of Data from children checkbox
   */
  async getChildrenAccountData(showChildren: boolean) {
    // Construct the filters once
    this.cs360Filters = await this.getCs360Filter(showChildren);
    // Load report again with updated filters
    setTimeout(()=>(<ReportWidgetCs360ElementLoader>this.componentRef.instance).onFilterUpdate(this.cs360Filters), 0);
    // Preserve state
    this.preserveState({showDataFromChildren: showChildren});
  }

  preserveState(stateProps: IGroupState): void {
    this.group.state = {...this.group.state, ...stateProps};
    this.action.emit({
      type: "PRESERVE_STATE",
      payload: { [this.group.id]: this.group.state }
    });
  }

  onResizeStart(event) {
    this.RESIZER_VALUES.dragging = true;
  }

  onResizeEnd(event) {
    this.RESIZER_VALUES.dragging = false;
  }

  mouseDownOnResizer(event) {
    this.applyHighlightColor(event);
    this.setDraggingFlag();
  }

  applyHighlightColor(event: Event = null) {
    if (!!event) {
      this.RESIZER_VALUES.resizer_class = this.RESIZER_VALUES.active_class;
      if (event.stopPropagation) {
        event.stopPropagation();
      }
    } else if (!this.RESIZER_VALUES.dragging) {
      this.clearHighlightColor();
    }
  }

  clearHighlightColor() {
    this.RESIZER_VALUES.resizer_class = this.RESIZER_VALUES.inactive_class;
  }

  setDraggingFlag() {
    this.RESIZER_VALUES.dragging = true;
  }

  isAccountHierarchyEnabled(): boolean {
    // need to display show data from children option only for C360 context
    return this.ctx.associatedContext===PageContext.C360 || this.ctx.pageContext === PageContext.C360;

  }

  // /**
  //  * Check if the object is transcational or not.
  //  * Check if the user has full Viewer license.
  //  * @param group
  //  */
  showAddRecordButton(group: IReportGroup): boolean {
    const GS: any = this.env.gsObject;
    const host: any = this.env.hostDetails;
    // We cannot show Add button in the Native if object is SFDC
    if(host.type === 'GAINSIGHT'
        && !HybridHelper.isSFDCHybridHost()
        && get(group, "collectionDetails.connectionType") === "SFDC") {
      return false;
    }

    if (GS.isReadOnlyApp) {
      return false
    }

    if (get(group, "collectionDetails.connectionType") === "SFDC") { // Meaning SFDC Object
      return true;
    } else {
      // Here for MDA object
      return isObjectTransactional(group);
    }
  }

  /**
   * Check if the object is transcational or not.
   * Check if the user has full Viewer license.
   * @param group
   */
  showActionColumn(group: IReportGroup): boolean {
    const GS: any = this.env.gsObject;
    const host: any = this.env.hostDetails;
    // We cannot show Add button in the Native if object is SFDC
    if(host.type === 'GAINSIGHT'
        && !HybridHelper.isSFDCHybridHost()
        && get(group, "collectionDetails.connectionType") === "SFDC") {
      return false;
    }

    if (GS.readOnlyUser) {
      return false
    }

    if (get(group, "collectionDetails.connectionType") === "SFDC") { // Meaning SFDC Object
      return true;
    } else {
      // Here for MDA object
      return isObjectTransactional(group);
    }
  }

  /**
   * Check if the object is transcational or not.
   * @param group
   */
  includeIdField(group: IReportGroup) {
    return isObjectTransactional(group);
  }

}
