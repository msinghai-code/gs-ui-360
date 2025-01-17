import { Component, Inject, Input, OnInit } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import { ISection } from '@gs/cs360-lib/src/common';
// import * as moment from 'moment';
import * as moment_ from 'moment';
const moment = moment_;
import { BaseSectionComponent } from '@gs/cs360-lib/src/common';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS, APPLICATION_MESSAGES } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { EnvironmentService } from '@gs/gdk/services/environment';
@Component({
  selector: 'gs-csm-company-intelligence',
  templateUrl: './csm-company-intelligence.component.html',
  styleUrls: ['./csm-company-intelligence.component.scss']
})
export class CsmCompanyIntelligenceComponent extends BaseSectionComponent implements OnInit {

  
  public config;
  @Input() section: ISection;
  options: any = {};
  ciSectionId: string = '';
  cdnPath: string = '';

  public ciUrl = '';

  constructor(@Inject("envService") public env: EnvironmentService,
    private _http: HttpProxyService,
    private _router: Router, private route: ActivatedRoute,
    @Inject(CONTEXT_INFO) public ctx) {
    super();
    this.ciUrl = `${this.env.gsObject.autonomousUrls['ci-elements']}/main-es2015.js`;
    
    // this.cdnPath = 'https://devstaticjs.develgs.com/ci-elements/ci_6087';
    // this.ciUrl = `${this.cdnPath}/main-es2015.js`;
    // this.ciUrl = 'https://localhost:4201/main.js';
  }

  ngOnInit() {
    this.options = { label: this.section.label };
    this.section.sectionMeta.subscribe(res => {                 // res = { unread: '0', lastAccess: '2021-09-28T05:34:37.684Z' }
      this.options = {
        ...this.options,
        data: res,
        timestamp: res ? res.lastAccess : null,
        ciCdnPath: this.cdnPath,
        companyName: this.ctx.companyName,
        companyId: this.ctx.cId
      };
    })
    this.saveCompanyIntelligenceTimeStamp();
    this.routerChanges();

    if (!this.ciSectionId) {
      this.ciSectionId = this.getSectionId(this._router.url);
    }
  }

  //  save CI ts to backend
  public async saveCompanyIntelligenceTimeStamp() {
    var res;
    var ts = moment().toISOString();
    const ciKeyLiteral = "CI_C360_LAST_ACCESS_TS_" + this.env.gsObject.companyId;
    const body = {
      "key": ciKeyLiteral,
      "value": ts
    }

    try {
      res = await this._http.put(API_ENDPOINTS.SALLY_STATE_API, body).toPromise();
      if (!(res && res.success)) {
        console.error(APPLICATION_MESSAGES.SALLY_ERRORS.stateResponseFailed)
      }
    } catch (e) {
      console.log(`${APPLICATION_MESSAGES.SALLY_ERRORS.statePreservation}:`, e);
    }
  }

  routerChanges() {
    this.route.url.subscribe((segment) => {
      if (segment && segment.length && segment[0] && (this.getSectionId(segment[0].path) === this.ciSectionId)) {
        this.options = { ...this.options, timestamp: moment().toISOString() }
      }
    })
  }

  getSectionId(url) {
    const urlRoutes = url.split('/');
    return urlRoutes[urlRoutes.length - 1];
  }

}
