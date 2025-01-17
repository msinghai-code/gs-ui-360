import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextWidgetSettingsComponent } from './text-widget-settings.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DescribeService } from "@gs/gdk/services/describe";
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzSelectModule } from '@gs/ng-horizon/select';
import {NzSwitchModule} from "@gs/ng-horizon/switch";
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [TextWidgetSettingsComponent],
  imports: [
    CommonModule,
    NzInputModule,
    FlexLayoutModule,
    NzSelectModule,
    NzFormModule,
    NzRadioModule,
    NzSwitchModule,
    FormsModule,
    ReactiveFormsModule,
    NzI18nModule
  ],
  providers: [DescribeService],
  exports: [TextWidgetSettingsComponent],
  entryComponents: [TextWidgetSettingsComponent]
})
export class TextWidgetSettingsModule { }
