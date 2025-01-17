import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericHostDirective } from './generic-host.directive';

@NgModule({
  declarations: [ GenericHostDirective],
  imports: [
    CommonModule
  ],
  exports: [GenericHostDirective],
  providers: []
})
export class GenericHostDirectiveModule { }
