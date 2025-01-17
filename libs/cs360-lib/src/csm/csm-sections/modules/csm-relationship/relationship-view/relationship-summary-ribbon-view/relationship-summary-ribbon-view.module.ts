import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzEmptyModule } from "@gs/ng-horizon/empty";
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';

import { SummaryRibbonAttributeViewComponent } from "./summary-ribbon-attribute-view/summary-ribbon-attribute-view.component";
import { RelationshipSummaryRibbonViewComponent } from "./relationship-summary-ribbon-view.component";
import { SummaryAttributeModule } from '@gs/cs360-lib/src/common';
import { RelationshipSummaryRibbonViewService } from "./relationship-summary-ribbon-view.service";
import { SpinnerModule } from '@gs/gdk/spinner';
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import {FlexModule} from "@angular/flex-layout";
import {NzIconModule} from "@gs/ng-horizon/icon";
import {NzToolTipModule} from "@gs/ng-horizon/tooltip";
import {NzDividerModule} from "@gs/ng-horizon/divider";
import {NzButtonModule} from "@gs/ng-horizon/button";

@NgModule({
  declarations: [
    RelationshipSummaryRibbonViewComponent,
    SummaryRibbonAttributeViewComponent
  ],
    imports: [
        CommonModule,
        NzEmptyModule,
        NzSkeletonModule,
        NzTypographyModule,
        SpinnerModule,
        SummaryAttributeModule,
        NzI18nModule,
        FlexModule,
        NzIconModule,
        NzToolTipModule,
        NzDividerModule,
        NzButtonModule
    ],
  exports: [RelationshipSummaryRibbonViewComponent],
  providers: [RelationshipSummaryRibbonViewService]
})
export class RelationshipSummaryRibbonViewModule { }
