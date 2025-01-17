import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ListItemSortComponent } from "./list-item-sort.component";
import { NzIconModule } from "@gs/ng-horizon/icon";

@NgModule({
  declarations: [ListItemSortComponent],
    imports: [
        CommonModule,
        DragDropModule,
        NzIconModule
    ],
  exports: [ListItemSortComponent]
})
export class ListItemSortModule { }
