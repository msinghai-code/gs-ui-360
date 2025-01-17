import { Component, Inject, OnInit } from "@angular/core";
import { BaseSectionComponent } from '@gs/cs360-lib/src/common';
import { ICONTEXT_INFO, CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';

@Component({
    selector: 'gs-csm-customer-goals-widget',
    templateUrl: './csm-customer-goals.component.html',
    styleUrls: ['./csm-customer-goals.component.scss']
})
export class CsmCustomerGoalsComponent extends BaseSectionComponent implements OnInit {
    widgetUrl: string;

    constructor(
                @Inject(CONTEXT_INFO) public context: ICONTEXT_INFO) {
        super();
    }

    async ngOnInit() {
        this.widgetUrl = await this.getWebComponentURL('cg-csm');   
    }

    async getWebComponentURL(moduleName: string) {
        const moduleUrl = await getCdnPath(moduleName);
        return `${moduleUrl || "https://localhost:4200"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
      }  
}
