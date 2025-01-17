import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzDatePickerModule } from '@gs/ng-horizon/date-picker';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzAutocompleteModule } from '@gs/ng-horizon/auto-complete';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { ObjectDataEditFormComponent } from "./object-data-edit-form.component";

@NgModule({
  declarations: [ObjectDataEditFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTypographyModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzEmptyModule,
    NzAutocompleteModule,
    NzIconModule,
    NzSwitchModule
  ],
  exports: [ObjectDataEditFormComponent]
})
export class ObjectDataEditFormModule { }
