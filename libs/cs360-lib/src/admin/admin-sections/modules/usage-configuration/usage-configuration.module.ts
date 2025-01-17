import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UsageConfigurationComponent } from './usage-configuration.component';
import { SpinnerModule } from "@gs/gdk/spinner";
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { LazyElementsModule } from "@angular-extensions/elements";

@NgModule({
  declarations: [UsageConfigurationComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    NzInputModule,
    NzSelectModule,
    NzTypographyModule,
    SpinnerModule,
    NzI18nModule,
    LazyElementsModule
  ],
  entryComponents: [UsageConfigurationComponent],
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsageConfigurationModule { }
