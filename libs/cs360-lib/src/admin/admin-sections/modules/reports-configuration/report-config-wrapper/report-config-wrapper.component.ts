import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ISection } from '@gs/report/reports-configuration/reports-configuration'
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {ReportsConfigurationComponent, ReportsConfigurationModule} from "@gs/report/reports-configuration";
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { isEmpty } from "lodash";


@Component({
  selector: 'gs-report-config-wrapper',
  templateUrl: './report-config-wrapper.component.html',
  styleUrls: ['./report-config-wrapper.component.scss'],
  providers: [ReportsConfigurationModule],
})
export class ReportConfigWrapperComponent implements OnInit {

  public section:any;

  @ViewChild("rcInstance", {static: false}) rcInstance : ReportsConfigurationComponent;
  reportConfigsection;
  reportConfigcontext;

  constructor(protected route: ActivatedRoute, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO ) {
    this.reportConfigcontext = this.ctx;
  }

  ngOnInit() {
    this.accessRoutes();
  }
  protected accessRoutes() {
    this.route.paramMap.subscribe((route: any) => {
      const { params } = route;
      this.reportConfigsection = isEmpty(params) ? this.section :  new ReportConfigsectoin(params);
    });
  }
  toJSON(){
    return this.rcInstance.toJSON();
  }
  validate(){
    return this.rcInstance.validate();
  }
  isConfigurationChanged(){
    return this.rcInstance.isConfigurationChanged();
  }
}
class ReportConfigsectoin implements ISection{
  sectionId?: string;
  id: number | string;
  label: string;
  sectionType: string;
  loadEagerly: boolean;
  link: string;
  isDetachSectionPreview?: boolean;
  isLoaded?: boolean;
  timeout?: number;
  layoutId?: string;
  config?: any;
  configured?: boolean;
  scope?: string;
  sections?: any[]; // SummaryWidget as any
  description?: string;
  state?: any;
  tenantId?: string;
  pinned?: boolean;
  tempPinned?: boolean;
  relationshipTypeId?: string;
  layoutName?: string;
  sectionMeta?: any | Observable<any>;
  constructor(config?) {
    if(config){
      this.sectionId = config?config.sectionId:"";
      this.layoutId = config?config.layoutId:"";
      this.loadEagerly = true;
      this.isDetachSectionPreview = false;
    }
  }
}
