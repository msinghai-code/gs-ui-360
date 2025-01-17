import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageWidgetSettingsComponent } from './image-widget-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [ImageWidgetSettingsComponent],
  imports: [
    CommonModule,
    NzInputModule,
    FlexLayoutModule,
    NzSelectModule,
    NzFormModule,
    FormsModule,
    NzRadioModule,
    ReactiveFormsModule,
    EnvironmentModule,
    NzI18nModule
  ],
  entryComponents: [ImageWidgetSettingsComponent],
  exports: [ImageWidgetSettingsComponent]
})
export class ImageWidgetSettingsModule { }
