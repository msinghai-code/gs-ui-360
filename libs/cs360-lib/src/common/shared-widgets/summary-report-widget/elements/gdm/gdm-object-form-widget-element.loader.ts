// Angular
import {
    Input,
    OnInit,
    OnDestroy,
    Component,
    Output,
    EventEmitter, Inject
} from "@angular/core";

// Core
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
    template: `
    <ng-container *ngIf="load">

        <ax-lazy-element
            [objectName]="objectName"
            [modeFromParent]="mode"
            [recordGsid]="gsid"
            [autoPopulateConfig]="autoPopulateConfig"
            [drawerEnabled]="drawerEnabled"
            (changes)="onChange($event)"
            *axLazyElementDynamic="elementTag, url: url; loadingTemplate: loading; errorTemplate: error">
        </ax-lazy-element>

        <ng-template #loading>
            <div class="rw-element-loader" style="height: 100%;" gsSpinner [show]="true"></div>
        </ng-template>

        <ng-template #error>
            <nz-result nzStatus="warning"
                nzTitle="Something went wrong!!!"
                nzSubTitle="There was a problem in loading this widget. Try again or reach out to Gainsight support if the problem persists."></nz-result>
        </ng-template>

    </ng-container>`,
})

export class GdmObjectFormWidgetCs360ElementLoader implements OnInit, OnDestroy {

    @Input() objectName: string; // mda object name;
    @Input() mode = "ADD"; // ADD | PREVIEW | EDIT
    @Input() gsid = ""; // gsid of the record.
    @Input() drawerEnabled = false;

    @Output() changes: EventEmitter<any> = new EventEmitter<any>();

    url;
    elementTag = 'gs-object-form';
    load = false;

    autoPopulateConfig = null;

    constructor(@Inject("envService") public env: EnvironmentService) {}

    async ngOnInit() {
        /**
         * SFDC => getCdnPath('report-widget')
         * Native => this.env.getGS().autonomousUrls['report-widget']
         */
        const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['gdm-object-form'] : (getCdnPath('gdm-object-form'));
        this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER? 'main-es5.js':'main-es2015.js'}`; //Point to local host if required

        // this.url = 'https://devstaticjs.develgs.com/gdm-object-form/praj_7078/main-es2015.js';
        // this.url = 'https://localhost:4201/main.js';

        this.autoPopulateConfig = this.getAutoPopulateConfig();

        this.load = true;
    }

    getAutoPopulateConfig() {
        const GS = this.env.gsObject;
        const gsid = GS.isCS360 ? GS.companyId : GS.relationshipId;
        const object = GS.isCS360 ? "company" : "relationship";
        return [{
            gsid,
            object
        }];
    }

    onChange(event: any) {
        this.changes.emit(event.detail);
    }

    ngOnDestroy() {

    }
}
