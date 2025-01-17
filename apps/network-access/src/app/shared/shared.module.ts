
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GSLayoutsModule } from '@gs/gdk/layouts';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { SpinnerModule } from '@gs/gdk/spinner';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    SpinnerModule,
    GSLayoutsModule,
    HttpClientModule,
    NzPopoverModule,
  ],
  exports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    GSLayoutsModule,
    HttpClientModule,
    NzPopoverModule,
  ]
})
export class SharedModule { }
