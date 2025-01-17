import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CS360CacheService } from '@gs/cs360-lib/src/common';
import { EnvironmentService } from '@gs/gdk/services/environment';
@Component({
  selector: 'gs-ci-widget',
  templateUrl: './ci-widget.component.html',
  styleUrls: ['./ci-widget.component.scss']
})
export class CiWidgetComponent extends CsmWidgetBaseComponent implements OnInit {

  public ciUrl: string = '';
  public cdnPath: string;
  public options: ICIOptions = null;
  sectionType: string = "COMPANY_INTELLIGENCE";
  companyId: string = '';
  // public isCILoaded: boolean = false;

  label: string = 'Company Intelligence News';

  constructor(
      @Inject("envService") public env: EnvironmentService,
    public csmSummaryService: CsmSummaryService,
    @Inject(CONTEXT_INFO) public ctx,
    private cs360CacheService: CS360CacheService) {
    super(csmSummaryService, ctx);
    this.ciUrl = `${this.env.gsObject.autonomousUrls['ci-elements']}/main-es2015.js`;
    // this.cdnPath = 'https://devstaticjs.develgs.com/ci-elements/ci_6087';
    // this.ciUrl = `${this.cdnPath}/main-es2015.js`;

    // this.ciUrl = 'https://localhost:4200/main.js';
  }

  ngOnInit() {
    this.companyId = this.ctx.cId;
    this.options = {
      label: this.widgetItem.label,
      companyId: this.ctx.cId,
      companyName: this.ctx.companyName,
      isSummaryWidget: true,
      isCISectionAvailable: this.isCISectionAvailable
    }
  }

  navigateToCI(evt) {
    this.cs360CacheService.navigateToSection(this.sectionType);
  }

  get isCISectionAvailable(): boolean {
    return (this.env.moduleConfig.sections as any[]).some((section) => {
      return section.sectionType === this.sectionType;
    })
  }

}

interface ICIOptions {
  label: string,
  companyId: string,
  companyName: string,
  timestamp?: string,
  isSummaryWidget: boolean,
  isCISectionAvailable: boolean
}
