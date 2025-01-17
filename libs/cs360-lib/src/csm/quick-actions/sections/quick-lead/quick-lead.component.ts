import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
    selector: 'gs-quick-lead',
    templateUrl: './quick-lead.component.html',
    styleUrls: ['./quick-lead.component.scss']
})
export class QuickLeadComponent implements OnInit {
    elementTag = 'gs-leads-detail-form-element';
    url: string;
    properties = {};
    section = null;
    constructor(
        @Inject("envService") public env: EnvironmentService,
        @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
        private cdr: ChangeDetectorRef) {
    }

    async ngOnInit() {
        const leadSection = this.env.moduleConfig.sections.filter((section)=>section.sectionType === "LEADS");
        if(leadSection && leadSection.length){
            this.section = leadSection[0].config ? {config: leadSection[0].config} : null;
        }
        this.properties = {
            context : this.ctx,
            section: this.section
        }
        // this.url = "https://localhost:4201/main.js";
        const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['rc-widgets']
            : (await getCdnPath('rc-widgets'));
        this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    }
}
