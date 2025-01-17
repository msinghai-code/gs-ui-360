import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {InlineTextEditorComponent} from "./inline-text-editor.component";
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
  declarations: [InlineTextEditorComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NzInputModule,
        NzFormModule,
        NzToolTipModule,
        NzI18nModule
    ],
  exports: [InlineTextEditorComponent]
})
export class InlineTextEditorModule { }
