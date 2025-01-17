import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzInputModule } from '@gs/ng-horizon/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputNumberModule } from '@gs/ng-horizon/input-number';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { EmbedPageConfigurationComponent } from './embed-page-configuration.component';
import { NzGridModule } from '@gs/ng-horizon/grid';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';

@NgModule({
  declarations: [EmbedPageConfigurationComponent],
  imports: [
    CommonModule,
    NzFormModule,
    NzIconModule,
    FormsModule,
    NzButtonModule,
    NzRadioModule,
    NzSelectModule,
    NzGridModule,
    ReactiveFormsModule,
    NzTypographyModule,
    NzInputModule,
    FlexLayoutModule,
    NzInputNumberModule,
    NzToolTipModule,
    NzCheckboxModule,
    EnvironmentModule,
    NzI18nModule
  ],
  entryComponents: [EmbedPageConfigurationComponent]
})
export class EmbedPageConfigurationModule { }
