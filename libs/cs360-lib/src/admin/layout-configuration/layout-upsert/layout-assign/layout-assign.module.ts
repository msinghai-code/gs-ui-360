import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ObjectFilterQueryModule } from '@gs/gdk/filter/builder';
import { SpinnerModule } from '@gs/gdk/spinner';

import { LayoutAssignComponent } from './layout-assign.component';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';

import { NzTypographyModule } from '@gs/ng-horizon/typography';

import { NzI18nModule } from '@gs/ng-horizon/i18n';


@NgModule({
  declarations: [
    LayoutAssignComponent
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    NzInputModule,
    NzIconModule,
    NzDrawerModule,
    NzButtonModule,
    NzTypographyModule,
    ObjectFilterQueryModule,
    NzI18nModule
  ],
  exports: [LayoutAssignComponent],
  providers: [
  ]
})
export class LayoutAssignModule {
}
