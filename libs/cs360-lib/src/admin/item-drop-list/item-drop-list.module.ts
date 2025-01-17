import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzButtonModule } from '@gs/ng-horizon/button';

import { ItemDropListComponent } from "./item-drop-list.component";
import { ListItemComponent } from "./list-item/list-item.component";
import { InlineTextEditorModule } from '@gs/cs360-lib/src/common';
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
  declarations: [ItemDropListComponent, ListItemComponent],
  imports: [
    CommonModule,
    GridsterModule,
    DragDropModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    InlineTextEditorModule,
    NzI18nModule
  ],
  exports: [ItemDropListComponent, ListItemComponent]
})
export class ItemDropListModule { }
