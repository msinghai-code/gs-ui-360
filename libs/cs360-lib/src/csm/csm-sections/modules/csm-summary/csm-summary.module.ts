import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmSummaryComponent } from './csm-summary.component';
import { GridsterModule } from 'angular-gridster2';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EmptyModule } from '../empty/empty.module';
import { CsmWidgetsModule } from '../../../csm-widgets/csm-widgets.module';
import { CsmSummaryService } from './csm-summary.service';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import { BaseCsmWidgetRendererModule } from './base-csm-widget-renderer/base-csm-widget-renderer.module';

import {ReportWidgetElementModule} from "@gs/cs360-lib/src/common";
import {NzButtonModule} from "@gs/ng-horizon/button";
import {NzIconModule} from "@gs/ng-horizon/icon";
import {NzDropDownModule} from "@gs/ng-horizon/dropdown";
import {ColumnChooserModule} from "@gs/gdk/column-chooser";
@NgModule({
  declarations: [CsmSummaryComponent],
    imports: [
        CommonModule,
        GridsterModule,
        NzEmptyModule,
        FlexLayoutModule,
        EmptyModule,
        CsmWidgetsModule,
        NzToolTipModule,
        NzTypographyModule,
        NzI18nModule,
        BaseCsmWidgetRendererModule,
        ReportWidgetElementModule,
        NzButtonModule,
        NzIconModule,
        NzDropDownModule,
        ColumnChooserModule
    ],
  entryComponents: [CsmSummaryComponent],
  exports: [CsmSummaryComponent],
  providers: [CsmSummaryService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmSummaryModule {
  static entry = CsmSummaryComponent;
}
