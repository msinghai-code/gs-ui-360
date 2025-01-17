import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TokenFieldComponent} from "./token-field.component";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TokenFieldComponent],
  exports: [TokenFieldComponent]
})
export class TokenFieldModule { }
