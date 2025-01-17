import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { isEmpty, cloneDeep } from 'lodash';
import { LayoutAssignmentDetails, LayoutAssignMeta, LayoutDetails } from '../layout-upsert.interface';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LayoutStatus } from '../layout-upsert.constants';
import { GLOBAL_FILTER_MAX_LIMIT, GLOBAL_FILTER_MESSAGE_CONSTANTS } from '@gs/gdk/core';
import { ObjectFilterQueryComponent } from "@gs/gdk/filter/builder";
import {GSGlobalFilter} from "@gs/gdk/filter/global/core/global-filter.interface";
import { GlobalFilterService } from "@gs/gdk/filter/global";
import { LayoutUpsertService } from '../layout-upsert.service';
import { APPLICATION_ROUTES, PageContext } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { EnvironmentService, UserService } from '@gs/gdk/services/environment';
// import { CS360Service} from "@gs/cs360-lib";
import { CS360Service } from '@gs/cs360-lib/src/common';
import {operatorMap} from "@gs/cs360-lib/src/common";
import { HybridHelper } from '@gs/gdk/utils/hybrid';

@Component({
  selector: 'gs-layout-assign',
  templateUrl: './layout-assign.component.html',
  styleUrls: ['./layout-assign.component.scss']
})
export class LayoutAssignComponent implements OnInit {

  
  @ViewChild(ObjectFilterQueryComponent, {static: false}) fq: ObjectFilterQueryComponent;
  loading = false;
  isCreateMode: boolean;
  layoutDetails: LayoutDetails;
  changed = false;
  globalFilterConstants: any;
  saveClicked = false;
  isPartner: boolean = false;
  isC360: boolean = false;
  filterConfig: any;
  assignConditions: GSGlobalFilter;
  layoutAssignmentDetails: LayoutAssignmentDetails;
  currencyConfig;
  allowedDataTypes = Object.values(DataTypes).filter(type => ![DataTypes.IMAGE, DataTypes.RICHTEXTAREA, DataTypes.DATE, DataTypes.DATETIME].includes(type));

  protected subs = new SubSink();
  
  constructor(protected router: Router,
    @Inject(ADMIN_CONTEXT_INFO) protected ctx: IADMIN_CONTEXT_INFO,
    protected c360Service: CS360Service,
    @Inject("envService") protected env: EnvironmentService, protected gfs: GlobalFilterService,
    protected layoutUpsertService: LayoutUpsertService,
    protected route: ActivatedRoute,
    protected i18nService: NzI18nService,
    protected userService: UserService)  { }

  ngOnInit() {
    this.isC360 = this.ctx.pageContext === PageContext.C360 ? true : false;
    const queryParams = this.route.snapshot.queryParams;
    if(queryParams.managedAs  &&  queryParams.managedAs === "partner") {
      this.isPartner = true;
    }
    this.setGlobalFilterConstants();
    this.filterConfig = this.getFilterConfig();
    this.addRouteDataSubscription();
    this.setCurrencyConfig();
  }
  public sub_title=this.i18nService.translate(this.ctx.subTitle);

  protected setGlobalFilterConstants() {
    const objectList = [... this.ctx.layoutAssignConfig.objectList];
    objectList.map(obj => obj.objectLabel = this.i18nService.translate(obj.objectLabel));
    this.globalFilterConstants = {
      TOKENIZED: true,
      HOST: { id: "mda", name: "mda", type: "mda", apiContext : 'api/reporting/describe' },
      BASE_OBJECT: this.ctx.baseObject,
      OBJECT_LIST: objectList,
      NEST_LEVELS: 1,
      ADD_DEFAULT_RULE: true,
      EMPTYGLOBALFILTERS : {
          "conditions": [],
          "expression": ""
      }
    };
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

  protected getUserConfigByHostType(): any {
    return !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
  }

  protected getFilterConfig() {
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
        // dateLiterals: ReportFilterUtils.getDateLiterals(),
        // Added operator map
        // operatorMap: ReportFilterUtils.getOperatorMap(),
        // Added includes null
        honorIncludeNulls: true,
        // Check for strictness of expression
        strictCheck: true,
        // Show skeleton
        // showSkeleton: true,
        // Added isApplicable option to rule
        // honorIsApplicable: true,
        // enablePartialTree: true,
        // pageSize: 200,
        operatorMap: this.getOperatorMap(),
        allowedDataTypes: this.allowedDataTypes,
        showValidationsOnTouch: false,
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
  public getOperatorMap(): any {
    // const  i18nService = AppInjector.get(NzI18nService);
    for (const obj in operatorMap) {
        operatorMap[obj].forEach(ob => {
            ob.label = this.i18nService.translate(ob.label);
        })
    }
    return cloneDeep(operatorMap);
  }

  protected addRouteDataSubscription() {
    this.subs.add(this.route.data.subscribe(response => {
      const layoutAssignMeta: LayoutAssignMeta = response.meta;
      this.layoutDetails = layoutAssignMeta.layoutDetails;
      this.layoutAssignmentDetails = layoutAssignMeta.layoutAssignInfo;
      this.assignConditions = this.getUpdatedFilterConditions(layoutAssignMeta.layoutAssignInfo.filter);
      this.isCreateMode = this.route.snapshot.queryParams.mode === "create";
    }));
  }

  protected getUpdatedFilterConditions(filter: any) {
    if(isEmpty(filter)) {
      return {conditions: [], expression: ""};
    } 
    return {
      ...filter,
      conditions: filter.conditions.map(condition => {
        let filter = {...condition};
        filter.includeNulls = filter.filterValue.includeNulls;
        return Object.freeze(filter);
      })
    }
  }

  protected preValidateOnSave(globalFilters: GSGlobalFilter) {
    let error: any = {};
    if(globalFilters.conditions && (globalFilters.conditions.length > GLOBAL_FILTER_MAX_LIMIT)) {
      error = { message: GLOBAL_FILTER_MESSAGE_CONSTANTS.MAX_GLOBAL_FILTERS_ALLOWED, data: true }
    }
    return error;
  }

  protected destroyCacheAndNavigate(route?: string, extras?: NavigationExtras) {
    this.layoutUpsertService.destroyCache();
    let routerPath: string = this.isPartner ? APPLICATION_ROUTES.PARTNER_LAYOUTS : APPLICATION_ROUTES.STANDARD_LAYOUTS;
    this.router.navigate([route || routerPath], extras || {});
  }

  getIsChanged() {
    return this.changed && !this.saveClicked;
  }

  openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

  onCancelClick() {
    this.destroyCacheAndNavigate();
  }

  onBackClick() {
    this.destroyCacheAndNavigate(APPLICATION_ROUTES.LAYOUT_CONFIGURE(this.layoutDetails.layoutId), {queryParamsHandling: 'preserve'});
  }

  onSaveAsDraftClick() {
    this.layoutAssignmentDetails.layoutStatus = LayoutStatus.DRAFT;
    this.onSaveClick(false);
  }

  onStatusUpdate(event: any) {
    this.changed = true;
  }

  onSaveClick( setStatus = true) {
    if(!this.changed && (<ObjectFilterQueryComponent>this.fq).valid && (<ObjectFilterQueryComponent>this.fq).isValidExpression()) {
      this.assignConditions = this.assignConditions ? this.assignConditions : {conditions: [], expression: ""};
      this.makeSaveCall(setStatus);
      return;
    }
    if((<ObjectFilterQueryComponent>this.fq).valid && (<ObjectFilterQueryComponent>this.fq).isValidExpression()) {
      try {
        this.assignConditions = (<ObjectFilterQueryComponent>this.fq).serialize();
      }
      catch(e) {
        this.c360Service.createNotification('error', this.i18nService.translate('360.admin.LAYOUT_UPSERT_MESSAGES.INVALID_CONDITION'), 5000);
        return;
      }
      this.assignConditions.conditions.forEach(cond => {
        cond.filterValue.includeNulls = cond.includeNulls;
      })
      const error = this.preValidateOnSave(this.assignConditions);
      if(isEmpty(error)) {
        this.makeSaveCall(setStatus);
      } else {
        this.c360Service.createNotification('error', this.i18nService.translate('360.admin.LAYOUT_UPSERT_MESSAGES.INVALID_CONDITION'), 5000);
      }
    } else {
        this.c360Service.createNotification('error', this.i18nService.translate('360.admin.LAYOUT_UPSERT_MESSAGES.INVALID_CONDITION'), 5000);
    }
  }

  navigateToUrl() {
    let url = HybridHelper.generateNavLink("partnerconfiguration");
    if(HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, false);
    } else {
      window.open(url, '_self');
    }
  }

  protected makeSaveCall(setStatus = true) {
    this.saveClicked = true;
    this.layoutAssignmentDetails.filter = this.assignConditions;
    this.layoutAssignmentDetails.layoutId = this.layoutDetails.layoutId;
    this.layoutAssignmentDetails.filter.conditions.forEach(cond => {
      delete cond.leftOperand.dbName;
      delete cond.leftOperand.objectDBName;
    });
    if(setStatus) {
      this.layoutAssignmentDetails.layoutStatus = this.assignConditions.conditions.length ? LayoutStatus.ASSIGNED : LayoutStatus.UNASSIGNED;
    }
    this.layoutUpsertService.setLayoutAssignment(this.layoutAssignmentDetails).subscribe(response => {
      if (this.isCreateMode){
        // this.toastMessageService.add( LAYOUT_UPSERT_MESSAGES.LAYOUT_CREATED_SUCCESS, MessageType.SUCCESS, null, {horizontalPosition:"center",duration:5000},);
        this.c360Service.createNotification('success',this.i18nService.translate('360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_CREATED_SUCCESS'),5000, 'bottomLeft');
      }
      else {
        // this.toastMessageService.add( LAYOUT_UPSERT_MESSAGES.LAYOUT_UPDATE_SUCCESS, MessageType.SUCCESS, null, {horizontalPosition:"center",duration:5000});
        this.c360Service.createNotification('success',this.i18nService.translate('360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_UPDATE_SUCCES'),5000, 'bottomLeft');
      }
     
      this.destroyCacheAndNavigate();
    },
       error=> {
         console.log(error.message);
    })
  }
}
