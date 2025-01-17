import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadsWidgetComponent } from './leads-widget.component';
import {NzIconModule} from "@gs/ng-horizon/icon";
import {NzToolTipModule} from "@gs/ng-horizon/tooltip";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import {NzTypographyModule} from "@gs/ng-horizon/typography";
import {FlexModule} from "@angular/flex-layout";

@NgModule({
  declarations: [LeadsWidgetComponent],
    imports: [
        CommonModule,
        NzIconModule,
        NzToolTipModule,
        NzI18nModule,
        NzTypographyModule,
        FlexModule
    ],
  entryComponents:[LeadsWidgetComponent],
  exports: [LeadsWidgetComponent]
})
export class LeadsWidgetModule { }
