import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CockpitDefaultSettingComponent, DisableOptionPipe } from './cockpit-default-setting/cockpit-default-setting.component';
import { CockpitWidgetComponent } from './cockpit-widget.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
@NgModule({
  declarations: [CockpitDefaultSettingComponent, CockpitWidgetComponent, DisableOptionPipe],
  imports: [
    CommonModule,
    NzInputModule,
    FlexLayoutModule,
    NzSelectModule,
    NzFormModule,
    NzRadioModule,
    FormsModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzTypographyModule,
    DocumentEventModule,
    NzToolTipModule
  ],
  entryComponents: [CockpitDefaultSettingComponent, CockpitWidgetComponent]
})
export class CockpitWidgetModule { }
