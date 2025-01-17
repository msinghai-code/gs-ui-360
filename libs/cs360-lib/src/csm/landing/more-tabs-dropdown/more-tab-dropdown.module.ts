import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoreTabsDropdownComponent } from './more-tabs-dropdown.component';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { FlexLayoutModule } from "@angular/flex-layout";
import { NzDividerModule } from '@gs/ng-horizon/divider';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { GsPipesModule } from "@gs/gdk/pipes";

import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [MoreTabsDropdownComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NzInputModule,
    NzSelectModule,
    NzDropDownModule,
    NzIconModule,
    NzButtonModule,
    FlexLayoutModule,
    NzDividerModule,
    NzTypographyModule,
    GsPipesModule,
    // CommonPipesModule,
    NzTypographyModule,
    NzI18nModule
  ],
  providers: [
  ],
  exports: [MoreTabsDropdownComponent]
})
export class MoreTabDropdownModule { }
