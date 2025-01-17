import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ReportFilter } from "@gs/report/pojos";
import { ReportFilterUtils} from "@gs/report/utils";
import { isEmpty } from "lodash";
import { ReportWidgetCs360ElementLoader } from './elements/report-widget-element.loader';
import {SummaryReportWidgetService} from "./summary-report-widget.service";
import {CONTEXT_INFO, ICONTEXT_INFO} from "../../context.token";
import {MiniPrefix, ObjectNames, PageContext} from './../../cs360.constants';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { summaryReportWidgetConfig } from './summary-report-widget.config';
import {getReporting360Ctx} from "../../utils/common-shared.utils";
import {isMini360} from "../../cs360.utils";

@Pipe ({ name: "charticon" })
export class ChartIcon implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'stacked_bar':
        return `bar`;
      case 'stacked_column':
        return `column`;
      case 'column_line':
        return `column`;
      case 'gauge':
      case 'funnel':
        return 'column'
      default: return value;
    }
  }
}

@Component({
  selector: 'gs-summary-report-widget',
  templateUrl: './summary-report-widget.component.html',
  styleUrls: ['./summary-report-widget.component.scss']
})
export class SummaryReportWidgetComponent implements OnInit {

  widgetItem: any;
  @Output() changes = new EventEmitter<any>();
  @ViewChild("reportHostElem", { static: false }) reportHostElemRef: ElementRef;
  public componentRef: any = null;
  isCsm: boolean = false;
  entityId;
  private cs360Filters: ReportFilter;
  isC360 : boolean = true;
  public renderReport: boolean = true;
  public error = {
    show: false,
    message: null,
    code: null
  };
  allowConfigure: boolean = false;

  constructor(private cfr: ComponentFactoryResolver,
              @Inject("envService") public env: EnvironmentService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              private summaryReportWidgetService: SummaryReportWidgetService,
              protected viewContainerRef: ViewContainerRef) {
               }

  ngOnInit() {
    if(this.ctx) {
      // this.isC360 = this.ctx.pageContext === PageContext.C360;
      this.allowConfigure = summaryReportWidgetConfig[this.ctx.pageContext].configurable;
    }
    if (this.isCsm) {
      setTimeout(()=>{
        this.loadReports();
      })
    }
  }

  async loadReports() {
    // Get Company Filters
    this.cs360Filters = await this.getFilters();
    const { itemId } = (this as any).widgetItem;
    const reportWidgetElementComponentFactory = this.cfr.resolveComponentFactory(ReportWidgetCs360ElementLoader);
    const viewContainerRef = this.viewContainerRef;
    viewContainerRef.clear();
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.componentRef = viewContainerRef.createComponent(reportWidgetElementComponentFactory);
    const widgetInstance = this.componentRef.instance as any;
    widgetInstance.id = isMini360(this.ctx)? MiniPrefix+itemId: itemId; // widget id
    widgetInstance.properties = this.getProperties();
    widgetInstance.cs360Filters = { whereAdvanceFilter: this.cs360Filters, havingAdvanceFilter: ReportFilterUtils.emptyFilters() };
    widgetInstance.showActionColumn = false;
    widgetInstance.showAddRecordButton = false;
    widgetInstance.includeId = false;
    widgetInstance.dataFromChildrenOptions = { show: false };
    widgetInstance.honorPadding = false;
    widgetInstance.useCache = false;
    widgetInstance.changes.subscribe((event: any) => {
    });
    this.componentRef.changeDetectorRef.detectChanges();
    widgetInstance.element = this.componentRef.location.nativeElement;
    this.reportHostElemRef.nativeElement.appendChild(widgetInstance.element);
  }

  getProperties(report?: any) {
    const { config } = (this as any).widgetItem;
    let globalFilterAlias = 'reports.widget.global_filter_alias.relationship_filter';
    if(this.ctx.baseObject === ObjectNames.PERSON){
      globalFilterAlias = 'reports.widget.global_filter_alias.person_filter';
    }else if(this.ctx.baseObject === ObjectNames.COMPANY){
      globalFilterAlias = 'reports.widget.global_filter_alias.company_filter';
    }
    return {
      name: config.reportName,
      referenceId: config.reportId,
      context: {
        layoutId: (this as any).layoutId || '',
        loadWidgetData: true,
        requestSource: this.ctx.pageContext,
        globalFilterAlias,
        exportsPayloadKey: "c360ReportDataRequestDTO",
        ...getReporting360Ctx(this.ctx)
      }
    }
  }

  private getFilters(): Promise<ReportFilter> {
    switch (this.ctx.baseObject) {
      case ObjectNames.COMPANY:
        return this.getCs360Filters();
      case ObjectNames.RELATIONSHIP:
        return this.getR360Filters();
      case ObjectNames.PERSON:
        return this.getP360Filters();
      default: return this.getCs360Filters();
    }
  }

  private async getP360Filters(): Promise<ReportFilter> {
    if(!this.cs360Filters) {
      const payload: ReportFilter = await this.constructFilterPayload();
      return !isEmpty(payload) ? payload: {};
    } else {
      return new Promise(res => res(this.cs360Filters));
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


  private async getR360Filters(): Promise<ReportFilter> {
    const { config } = (this as any).widgetItem;
    if(!this.cs360Filters) {
      const { rId, relationshipTypeId  } = this.ctx;
      const { objectName = '', objectLabel = '' } = !isEmpty(config.collectionDetail) ? config.collectionDetail: {};
      const { error, data } = await this.summaryReportWidgetService.getRelationshipFilters({relationshipId: rId, relationshipTypeId, objectName, objectLabel});
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
    } else {
      return new Promise(res => res(this.cs360Filters));
    }
  }

  private constructFilterPayload(): Promise<ReportFilter> {
    const { config } = (this as any).widgetItem;
    if (config.filterField) {
      const type: string = !isEmpty(config.collectionDetail) ? config.collectionDetail.connectionType.toUpperCase(): 'MDA';
      const objectLabel: string = !isEmpty(config.collectionDetail) ? config.collectionDetail.objectLabel: null;
      if(this.ctx.pageContext === PageContext.P360){
          let finalFilters = [];
          switch(this.ctx.associatedContext){
            case PageContext.C360:
              finalFilters.push(config.filterField.filter(filterField => filterField.properties && filterField.properties.isP360CompanyFilter)[0]);
              break;
            case PageContext.R360:
              finalFilters.push(config.filterField.filter(filterField => filterField.properties && filterField.properties.isP360RelationshipFilter)[0]);
              break;
          }
          finalFilters.push(config.filterField.filter(filterField => filterField.properties && filterField.properties.isP360PersonFilter)[0]);
          config.filterField = finalFilters;
      }
      const payload = this.constructFilterPayloadByHostType(type, config.filterField, objectLabel);
      if(this.ctx.pageContext === PageContext.P360){
        return this.summaryReportWidgetService.getPersonFilters(payload);
      }
      return this.summaryReportWidgetService.getCompanyFilters(payload);
    } else {
      return new Promise(res => res({}));
    }
  }

  private constructFilterPayloadByHostType(type: string, filterField: any, objectLabel: string) {
    const companyId = this.ctx.cId || this.entityId;
    const personId = this.ctx.pId || this.ctx.entityId;
    const relationshipId = this.ctx.rId ||  this.ctx.entityId;
    switch (type) {
      case 'MDA':
        return {
          objectType: type,
          objectLabel,
          companyId,
          personId,
          relationshipId,
          showChildren: false,
          filter: {
            additionalFilters: filterField
          }
        }
      case 'SFDC':
        let connectionId: string = null;
        if(this.env.gsObject.userConfig.crmConnections && this.env.gsObject.userConfig.crmConnections.SFDC && this.env.gsObject.userConfig.crmConnections.SFDC[0]) {
          connectionId = this.env.gsObject.userConfig.crmConnections.SFDC[0];
        }
        return {
          connectionId,
          objectType: type,
          objectLabel,
          companyId,
          personId,
          relationshipId,
          showChildren: false,
          filter: {
            additionalFilters: filterField
          }
        }
    }
  }

  onConfigureClick(evt: MouseEvent | TouchEvent) {
    this.changes.emit({
      type: 'CONFIGURE',
      widgetItem: (this as any).widgetItem
    });
  }

}
