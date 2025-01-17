import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { EnvironmentModule } from "@gs/gdk/services/environment";

import { FieldSelectorDropdownComponent } from "./field-selector-dropdown.component";

@NgModule({
  declarations: [FieldSelectorDropdownComponent],
  imports: [
    CommonModule,
    NzButtonModule,
    NzDropDownModule,
    NzIconModule,
    NzToolTipModule,
    FieldTreeModule,
    EnvironmentModule
  ],
  exports: [FieldSelectorDropdownComponent]
})
export class FieldSelectorDropdownModule { }
