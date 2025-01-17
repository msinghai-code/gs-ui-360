import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzAutocompleteModule } from '@gs/ng-horizon/auto-complete';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { NzTypographyModule } from '@gs/ng-horizon/typography';

import { Gs360AppLinkModule } from "@gs/gdk/directives";
import { IntersectionObserverModule } from "@gs/gdk/widget-viewer";
import { CsmReportWidgetModule } from "./csm-report-widget/csm-report-widget.module";
import { CsmReportsService } from "./csm-reports.service";
import { CsmReportsComponent } from "./csm-reports.component";
import { ListItemSortModule, ReportWidgetElementModule } from '@gs/cs360-lib/src/common';
// import {ReportWidgetElementModule} from "../../../widgets/shared-widgets/summary-report-widget/elements/report-widget-element.module";

@NgModule({
  declarations: [
    CsmReportsComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        GridsterModule,
        CsmReportWidgetModule,
        IntersectionObserverModule,
        Gs360AppLinkModule,
        NzEmptyModule,
        NzButtonModule,
        NzInputModule,
        NzIconModule,
        NzAutocompleteModule,
        NzSelectModule,
        NzToolTipModule,
        NzModalModule,
        NzTypographyModule,
        ListItemSortModule,
        NzI18nModule,
        ReportWidgetElementModule
    ],
  entryComponents: [CsmReportsComponent],
  exports: [CsmReportsComponent],
  providers: [CsmReportsService]
})
export class CsmReportsModule {
    static entry = CsmReportsComponent;
}
