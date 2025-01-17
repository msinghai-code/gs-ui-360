import {ICONTEXT_INFO, isMini360, MiniPrefix, PageContext} from '@gs/cs360-lib/src/common';
import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ReportWidgetCs360ElementLoader } from '@gs/cs360-lib/src/common';
import { GSEventBusService } from "@gs/gdk/core";
import { ReportFilterUtils } from "@gs/report/utils";
import {CsmReportWidgetComponent} from "../csm-report-widget.component";
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {CsmReportsService} from "../../csm-reports.service";
import {NzModalService} from "@gs/ng-horizon/modal";
import {IReportGroup} from "@gs/report/reports-configuration/report-grouper/report-grouper";
import {CompactType, GridType} from "angular-gridster2";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { csmReportWidgetConfig } from '../csm-report-widget.config';

@Component({
  selector: 'gs-kpi-grouper-report-widget',
  templateUrl: './kpi-grouper-report-widget.component.html',
  styleUrls: ['./kpi-grouper-report-widget.component.scss']
})
export class KpiGrouperReportWidgetComponent extends CsmReportWidgetComponent implements OnInit {

  @Input() group: IReportGroup;

  @ViewChild("reportHostElemRef", { static: false }) reportHostElementRef: ElementRef;
  subGroupOptions: any;

  constructor(protected cfr: ComponentFactoryResolver,
              protected env: EnvironmentService,
              private _eleRef: ElementRef,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              protected csmReportsService: CsmReportsService,
              protected viewContainerRef: ViewContainerRef,
              protected modalService: NzModalService,
              protected eventService: GSEventBusService,
              protected i18nService: NzI18nService) {
    super(cfr, env, ctx, csmReportsService, viewContainerRef, modalService, eventService, i18nService);
  }

  async ngOnInit(): Promise<void> {
    super.setMini360Configs();
    this.initializeSubGroup();
    if(csmReportWidgetConfig[this.ctx.pageContext].getCompanyFilter) {
      const { state = {} } = this.group;
      // Construct the filters once
      const showChildren: boolean = !!state && state.showDataFromChildren ? true: false;
      this.cs360Filters = await this.getCs360Filter(showChildren);
    } else {
      this.cs360Filters = await this.getR360Filter();
    }
    // Load the reports dynamically
    this.loadReports();
  }

  initializeSubGroup() {
    this.subGroupOptions = {
      gridType: GridType.Fit,
      minCols: 2,
      maxCols: 2,
      minRows: 1,
      fixedRowHeight: 100,
      margin: 16,
      compactType: CompactType.None,
      mobileBreakpoint: 0,
      resizable: {
        enabled: false
      },
      draggable: {
        dropOverItems: true,
        enabled: false
      }
    }
    if (!this.isMini360Variant) {
      this.subGroupOptions.minCols = 6;
      this.subGroupOptions.maxCols = 6;
      this.subGroupOptions.minRows = 2;
      this.subGroupOptions.maxRows = 2;
    }
  }

  async getR360Filter() {
    const { rId, relationshipTypeId  } = this.ctx;
    const { collectionDetails: { objectName = '', objectLabel = '' } = {} } = this.group;
    const { error, data } = await this.csmReportsService.getRelationshipFilters({relationshipId: rId, relationshipTypeId, objectName, objectLabel});
    if(error) {
      this.renderReport = false;
      this.error = {
        ...this.error,
        message: data.message
      };
      return null;
    } else {
      this.renderReport = true;
      return data;
    }
  }

  loadReports() {
    this.loading = true;
    this.group.subGroups.forEach((kpiReport) => {
      const { id } = kpiReport;
      const csmReportWidgetElementComponentFactory = this.cfr.resolveComponentFactory(ReportWidgetCs360ElementLoader);
      let componentRef = this.viewContainerRef.createComponent(csmReportWidgetElementComponentFactory);
      const widgetInstance = componentRef.instance as any;
      (<ReportWidgetCs360ElementLoader>componentRef.instance).id = isMini360(this.ctx)? MiniPrefix+id : id;
      (<ReportWidgetCs360ElementLoader>componentRef.instance).properties = this.getProperties(kpiReport.report);
      (<ReportWidgetCs360ElementLoader>componentRef.instance).cs360Filters = { whereAdvanceFilter : this.cs360Filters, havingAdvanceFilter: ReportFilterUtils.emptyFilters() };
       // TODO: Need to check the condition for includeId
      // (<ReportWidgetCs360ElementLoader>this.componentRef.instance).includeId = this.includeIdField(this.group);
      (<ReportWidgetCs360ElementLoader>componentRef.instance).includeId = true;
      if(csmReportWidgetConfig[this.ctx.pageContext].getCompanyFilter) {
        (<ReportWidgetCs360ElementLoader>componentRef.instance).dataFromChildrenOptions = this.getDataFromChildrenOptions();
      } else {
        (<ReportWidgetCs360ElementLoader>componentRef.instance).dataFromChildrenOptions = {show: false, value: false};
      }
      (<ReportWidgetCs360ElementLoader>componentRef.instance).disableFilterModification = false;
      (<ReportWidgetCs360ElementLoader>componentRef.instance).kpiCardViewEnabled = false;
      (<ReportWidgetCs360ElementLoader>componentRef.instance).useCache = false;
      (<ReportWidgetCs360ElementLoader>componentRef.instance).honorPadding = false;
      (<ReportWidgetCs360ElementLoader>componentRef.instance).changes.subscribe((event: any) => {
        // Exposed it to GDM for consumption
        const { type } = event;
        switch (type) {
          case "ON_ACTION_CLICK":
            this.handleAction(event);
            break;
          case "ADD_RECORD":
            this.openDrawer = true;
            this.handleAddRecord();
            break;
          case "DATA_FROM_CHILDREN":
            if(event.event.hasOwnProperty('event')) { // TODO mini360 make this consistent.
              this.getChildrenAccountData(event.event.event, componentRef);
            } else if(!event.event.hasOwnProperty('event') && event.hasOwnProperty('event')) {
              this.getChildrenAccountData(event.event, componentRef);
            }
            break;
          case "WIDGET_RENDERED":
            // Disabled report selection area.
            this.loading = false;
            break;
          default: null
        }
      });
      componentRef.changeDetectorRef.detectChanges();
      widgetInstance.element = componentRef.location.nativeElement;
      let elementRef = this._eleRef.nativeElement.querySelector(`#${kpiReport.id}`);
      elementRef.appendChild(widgetInstance.element);
    });
  }


  async getChildrenAccountData(showChildren: boolean, componentRef?: any) {
    // Construct the filters once
    this.cs360Filters = await this.getCs360Filter(showChildren);
    // Load report again with updated filters
    setTimeout(()=>(<ReportWidgetCs360ElementLoader>componentRef.instance).onFilterUpdate(this.cs360Filters), 0);
    // Preserve state
    this.preserveState({showDataFromChildren: showChildren});
  }

}
