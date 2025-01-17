import { NgModule } from '@angular/core';
import { SpinnerModule } from '@gs/gdk/spinner';
import { BaseTreeModule } from "@gs/gdk/base-tree";
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { ColumnPickerComponent } from './column-picker.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCollapseModule } from "@gs/ng-horizon/collapse";
import { NzInputModule } from "@gs/ng-horizon/input";
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
    declarations: [ColumnPickerComponent],
    imports: [
        CommonModule,
        BaseTreeModule,
        NzCollapseModule,
        NzInputModule,
        FormsModule,
        SpinnerModule,
        EnvironmentModule,
        NzI18nModule
    ],
    entryComponents : [ColumnPickerComponent],
    exports: [ColumnPickerComponent]
  })
  export class ColumnPickerModule { }
