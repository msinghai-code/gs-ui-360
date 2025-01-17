import { Component, Inject, OnInit } from '@angular/core';

import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
// import { CsmSummaryService } from '../../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CS360CacheService } from '@gs/cs360-lib/src/common';

@Component({
    selector: 'gs-csat-widget',
    templateUrl: './csat-widget.component.html',
    styleUrls: ['./csat-widget.component.scss']
})
export class CsatWidgetComponent extends CsmWidgetBaseComponent implements OnInit {

    elementTag = 'gs-csat-summary-widget';
    url: string;

    constructor(public csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx, private cs360CacheService: CS360CacheService,
                @Inject("envService") public env: EnvironmentService) {
        super(csmSummaryService, ctx);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.url = `${this.env.gsObject.autonomousUrls['survey-response']}/widgets/main-es2015.js`;
    }

    navigate(data) {
        this.cs360CacheService.navigateToSection('SURVEY', data && data.detail);
    }
}