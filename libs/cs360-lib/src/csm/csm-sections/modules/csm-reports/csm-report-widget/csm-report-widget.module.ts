import { NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpinnerModule } from '@gs/gdk/spinner';
import {NzTabsModule} from '@gs/ng-horizon/tabs';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzResultModule } from '@gs/ng-horizon/result';
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NzResizableModule } from '@gs/ng-horizon/resizable';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CsmReportWidgetComponent } from "./csm-report-widget.component";
import { ReportWidgetElementModule } from '@gs/cs360-lib/src/common';
import { GdmObjectFormWidgetElementModule } from '@gs/cs360-lib/src/common';
import {R360CsmReportWidgetComponent} from "./r360-csm-report-widget/r360-csm-report-widget.component";
import { RecordTypeSelectionModalComponent } from './record-type-selection-modal.component';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { KpiGrouperReportWidgetComponent } from './kpi-grouper-report-widget/kpi-grouper-report-widget.component';
import {GridsterModule} from "angular-gridster2";
import { IntersectionObserverModule } from '@gs/gdk/widget-viewer';

@NgModule({
  declarations: [
    CsmReportWidgetComponent,
    R360CsmReportWidgetComponent,
    RecordTypeSelectionModalComponent,
      KpiGrouperReportWidgetComponent
  ],
    imports: [
        FormsModule,
        CommonModule,
        NzTabsModule,
        SpinnerModule,
        NzModalModule,
        NzDrawerModule,
        NzSelectModule,
        NzResizableModule,
        NzResultModule,
        FlexLayoutModule,
        ReportWidgetElementModule,
        GdmObjectFormWidgetElementModule,
        NzToolTipModule,
        GridsterModule,
        IntersectionObserverModule
    ],
  entryComponents: [
    RecordTypeSelectionModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CsmReportWidgetComponent, R360CsmReportWidgetComponent, KpiGrouperReportWidgetComponent]
})
export class CsmReportWidgetModule { }
