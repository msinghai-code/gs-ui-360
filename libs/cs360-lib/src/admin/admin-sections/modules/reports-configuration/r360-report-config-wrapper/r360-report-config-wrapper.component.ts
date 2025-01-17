import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ISection } from '@gs/report/reports-configuration/reports-configuration'
import {combineLatest, Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {ReportsConfigurationComponent, ReportsConfigurationModule} from "@gs/report/reports-configuration";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-report-config-wrapper',
  templateUrl: './r360-report-config-wrapper.component.html',
  styleUrls: ['./r360-report-config-wrapper.component.scss'],
  providers: [ReportsConfigurationModule]
})
export class R360ReportConfigWrapperComponent implements OnInit {


  @ViewChild("rcInstance", {static: false}) rcInstance : ReportsConfigurationComponent;
  reportConfigsection;
  reportConfigcontext;
  relationshipTypes: any;
  constructor(protected route: ActivatedRoute,
              @Inject('envService') private _env: EnvironmentService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO) {
    this.reportConfigcontext = this.ctx;
  }

  ngOnInit() {
    this.accessRoutes();
  }
  protected accessRoutes() {
    // params will have layoutid,sectionid
    // query params will have typeid
    // need to combine both for config
    combineLatest(this.route.paramMap,this.route.queryParamMap,).subscribe( (routes) =>{
      this.reportConfigsection = new R360ReportConfigsectoin({...routes[0]['params'],...routes[1]['params']});
    });
    const moduleconfig = this._env.moduleConfig;
    this.relationshipTypes = moduleconfig.relationshipTypes;
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
class R360ReportConfigsectoin implements ISection{
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
  typeId?: string;
  constructor(config?) {
    if(config){
      this.sectionId = config?config.sectionId:"";
      this.layoutId = config?config.layoutId:"";
      this.typeId = config?config.typeId:"";
      this.loadEagerly = true;
      this.isDetachSectionPreview = false;
    }
  }
}
