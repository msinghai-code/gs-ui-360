import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MomentDatePipe, ObjectCurrencyPipe, ObjectRTAPipe, ObjectNumberPipe } from './object-list.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MomentDatePipe, ObjectCurrencyPipe, ObjectRTAPipe, ObjectNumberPipe],
  exports : [MomentDatePipe, ObjectCurrencyPipe, ObjectRTAPipe, ObjectNumberPipe]
})
export class PipeModuleModule { }
