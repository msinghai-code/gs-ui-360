import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickCtaComponent } from './quick-cta.component';
import { LazyElementsModule } from '@angular-extensions/elements';
import { SpinnerModule } from '@gs/gdk/spinner';

@NgModule({
  declarations: [QuickCtaComponent],
  imports: [
    CommonModule,
    LazyElementsModule,
    // GSSpinnerModule
    SpinnerModule
  ],
  entryComponents : [QuickCtaComponent],
  exports : [QuickCtaComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuickCtaModule { }
