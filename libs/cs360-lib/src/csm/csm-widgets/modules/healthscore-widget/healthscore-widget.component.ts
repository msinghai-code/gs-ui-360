import { Component, Inject} from '@angular/core';
import { Subject } from 'rxjs';

import { EnvironmentService } from '@gs/gdk/services/environment';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';

import { CsmWidgetBaseComponent} from "../csm-widget-base/csm-widget-base.component";
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { PageContext } from '@gs/cs360-lib/src/common';
import { WidgetItemSubType } from '@gs/cs360-lib/src/common';
import { CS360CacheService } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-healthscore-widget',
  templateUrl:"./healthscore-widget.component.html",
  styleUrls:["./healthscore-widget.component.scss"]
})
export class HealthScoreWidgetComponent extends CsmWidgetBaseComponent {
  refreshEventsSubject: Subject<void> = new Subject<void>();
  elementTag = 'gs-healthscore-widget-element';

  url: string;

  options:any = {};

  companyId: string = '';

  load = false;

  autonomousKey = 'scorecard-widgets';

  constructor(@Inject("envService") public env: EnvironmentService,
              public csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx,
              private cs360CacheService: CS360CacheService) {
    super(csmSummaryService, ctx);
  }

  async ngOnInit() {
    super.ngOnInit();
    this.companyId = this.ctx.cId || this.ctx.entityId;
    const entity = this.ctx.baseObject.toUpperCase();
    const { subType, config } = this.widgetItem;
    const isMetricOnly = subType && WidgetItemSubType.HEALTH_SCORE_METRIC === subType ? true : false;
    this.options = {
      companyId: this.companyId,
      entity,
      relationshipId : entity === "RELATIONSHIP" ? this.ctx.rId : '',
      isMetricOnly,
      isViewMeasure: config && config.isViewMeasure || false,
      appVariant: this.ctx.appVariant
    }
    const moduleUrl =  await getCdnPath(this.autonomousKey);
    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    // this.url = "https://localhost:4201/main.js";
    this.load = true;
  }
  navigate(data) {
    this.cs360CacheService.navigateToSection('SCORECARD', {});
  }
  onRefresh() {
    this.refreshEventsSubject.next();
  }
}
