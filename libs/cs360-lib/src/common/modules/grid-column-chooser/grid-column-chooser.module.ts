import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GsPipesModule } from "@gs/gdk/pipes";
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { GridColumnChooserComponent } from "./grid-column-chooser.component";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { ColumnChooserModule } from '@gs/gdk/column-chooser';

@NgModule({
    declarations: [
        GridColumnChooserComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NzCheckboxModule,
        NzEmptyModule,
        NzIconModule,
        NzButtonModule,
        NzPopoverModule,
        NzInputModule,
        GsPipesModule,
        NzI18nModule,
        ColumnChooserModule
    ],
    exports: [GridColumnChooserComponent]
})
export class GridColumnChooserModule { }
