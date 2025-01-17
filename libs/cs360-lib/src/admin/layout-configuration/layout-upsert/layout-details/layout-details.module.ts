import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerModule } from '@gs/gdk/spinner';
import { LayoutDetailsComponent } from './layout-details.component';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [
    LayoutDetailsComponent
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzButtonModule,
    NzTypographyModule,
    NzToolTipModule,
    NzI18nModule,
  ],
  exports: [LayoutDetailsComponent],
  providers: [
  ]
})
export class LayoutDetailsModule {
}
