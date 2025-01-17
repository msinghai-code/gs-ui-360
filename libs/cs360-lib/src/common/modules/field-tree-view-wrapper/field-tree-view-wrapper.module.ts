import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { FieldTreeViewWrapperComponent } from './field-tree-view-wrapper.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [FieldTreeViewWrapperComponent],
  imports: [
    CommonModule,
    FieldTreeModule,
    FlexLayoutModule
  ],
  providers: [],
  exports: [FieldTreeViewWrapperComponent]
})
export class FieldTreeViewWrapperModule { }
