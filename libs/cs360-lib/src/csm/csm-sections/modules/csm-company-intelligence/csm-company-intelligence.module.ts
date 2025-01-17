import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GridsterModule } from 'angular-gridster2';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { CsmCompanyIntelligenceComponent } from './csm-company-intelligence.component';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [CsmCompanyIntelligenceComponent],
  imports: [
    CommonModule,
    NzEmptyModule,
    FlexLayoutModule,
    GridsterModule,
    NzTypographyModule,
    NzDividerModule,
    LazyElementsModule
  ],
  entryComponents: [CsmCompanyIntelligenceComponent],
  exports: [CsmCompanyIntelligenceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmCompanyIntelligenceModule {
  static entry = CsmCompanyIntelligenceComponent;
}
