import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { CsmReportWidgetComponent } from "../csm-report-widget.component";
import { GSEventBusService } from "@gs/gdk/core";
import { ReportFilterUtils } from "@gs/report/utils";
import {isEmpty} from "lodash";
import {CsmReportsService} from "../../csm-reports.service";
import {ICONTEXT_INFO, isMini360, MiniPrefix, ReportWidgetCs360ElementLoader} from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';

// Horizon
import { NzModalService } from '@gs/ng-horizon/modal';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-r360-csm-report-widget',
  templateUrl: './r360-csm-report-widget.component.html',
  styleUrls: ['./../csm-report-widget.component.scss', './r360-csm-report-widget.component.scss']
})
export class R360CsmReportWidgetComponent extends CsmReportWidgetComponent implements OnInit {

  @ViewChild("reportHostElemRef", { static: false }) reportHostElementRef: ElementRef;

  constructor(protected cfr: ComponentFactoryResolver,
              protected env: EnvironmentService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              protected csmReportsService: CsmReportsService,
              protected viewContainerRef: ViewContainerRef,
              protected modalService: NzModalService, 
              protected eventService: GSEventBusService,
              protected i18nService: NzI18nService) {
    super(cfr, env, ctx, csmReportsService, viewContainerRef, modalService, eventService, i18nService);
  }

  async ngOnInit() {
    super.setMini360Configs();
    if(isEmpty(this.selectedReport)) {
      // Select first report as selected if nothing is selected.
      this.updateSelectedReport();
    }
    // Construct the filters once
    this.cs360Filters = await this.getR360Filter();
    // Load the report dynamically
    if(this.renderReport) {
      this.loadReports(this.selectedReport);
    }
  }

  // Get Relationship filter.
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

    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).dataFromChildrenOptions = {show: false, value: false};
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).disableFilterModification = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).kpiCardViewEnabled = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).useCache = false;
    (<ReportWidgetCs360ElementLoader>this.componentRef.instance).extraQueryParams = this.getExtraQueryParams();
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
          this.handleAddRecord(urls);
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
    this.componentRef.changeDetectorRef.detectChanges();
    widgetInstance.element = this.componentRef.location.nativeElement;
    this.reportHostElementRef.nativeElement.appendChild(widgetInstance.element);
  }


}
