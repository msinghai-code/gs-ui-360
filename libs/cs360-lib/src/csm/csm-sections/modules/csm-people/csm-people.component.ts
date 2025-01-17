import {Component, Inject, Input, OnInit} from '@angular/core';

import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';

@Component({
    selector: 'gs-csm-people',
    templateUrl: './csm-people.component.html',
    styleUrls: ['./csm-people.component.scss']
})
export class CsmPeopleComponent implements OnInit {
    elementTag = 'gs-people-section';
    url: string;
    bootstrapConfig;
    @Input() section;
    constructor(
        @Inject("envService") public env: EnvironmentService,
        @Inject(CONTEXT_INFO) public ctx
    ) {
        if(this.ctx && this.ctx.consumptionArea === 'zoom'){
            this.elementTag = 'gs-360-people-zoom';
        }
    }

    async ngOnInit() {
         //this.url = "https://localhost:4200/main.js";
         this.bootstrapConfig = this.env.moduleConfig.bootstrapConfig;
         const moduleName = this.elementTag.substring(this.elementTag.indexOf("people"));
         const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls[moduleName]
             : (await getCdnPath(moduleName));
         this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    }

}
