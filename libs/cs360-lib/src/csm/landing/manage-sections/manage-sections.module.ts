import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageSectionsComponent } from './manage-sections.component';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { FlexLayoutModule } from "@angular/flex-layout";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';

import { SpinnerModule } from '@gs/gdk/spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GsPipesModule } from "@gs/gdk/pipes";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import {NzSpinModule} from "@gs/ng-horizon/spin";

@NgModule({
  declarations: [ManageSectionsComponent],
    imports: [
        CommonModule,
        NzTypographyModule,
        NzInputModule,
        NzIconModule,
        FlexLayoutModule,
        DragDropModule,
        NzDividerModule,
        NzToolTipModule,
        GsPipesModule,
        FormsModule, ReactiveFormsModule,
        SpinnerModule,
        GsPipesModule,
        NzI18nModule,
        NzSpinModule
    ],
  exports: [ManageSectionsComponent]
})
export class ManageSectionsModule { }
