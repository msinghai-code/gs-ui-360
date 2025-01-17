import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { DialogModule } from '@gs/core';
import { DialogModule } from '@gs/cs360-lib/src/core-references';
import { GSLayoutsModule } from '@gs/gdk/layouts';
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { HttpClientModule } from '@angular/common/http';
import { ShowIfEllipsisDirective } from '../directives/show-if-ellipsis.directive';

@NgModule({
    declarations: [ ShowIfEllipsisDirective],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    GSLayoutsModule,
    HttpClientModule,
    NzPopoverModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    GSLayoutsModule,
    HttpClientModule,
    NzPopoverModule,
    ShowIfEllipsisDirective
    ]
})
export class SharedModule { }