import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LazyElementsModule } from "@angular-extensions/elements";

import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzTabsModule } from '@gs/ng-horizon/tabs';


import { PeopleConfigurationComponent } from './people-configuration.component';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [PeopleConfigurationComponent],
  imports: [
    CommonModule,
    LazyElementsModule,
    FlexLayoutModule,
    NzTabsModule,
    NzIconModule,
    NzI18nModule 
  ],
  entryComponents: [PeopleConfigurationComponent],
  exports: [PeopleConfigurationComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PeopleConfigurationModule { }
