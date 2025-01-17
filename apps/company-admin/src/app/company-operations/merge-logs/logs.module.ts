import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsComponent } from './logs.component';
import { SpinnerModule } from '@gs/gdk/spinner';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  MatDividerModule,
  MatButtonModule,
  MatRadioModule,
  MatSelectModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatTabsModule,
  MatChipsModule
} from '@angular/material';
import { LogsEffects } from './state/logs.effects';
import { LogsFacade } from './state/logs.facade';
import {
  LOGS_FEATURE_KEY,
  logsReducer,
  initialState as logsInitialState
} from './state/logs.reducer';
import { DataPersistence } from '@nrwl/angular';
import { PipeModuleModule } from '../pipe-module/pipe-module.module';
import { NzAlertModule } from '@gs/ng-horizon/alert';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { NzListModule } from "@gs/ng-horizon/list";
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";

@NgModule({
    imports: [
        CommonModule,
        MatDividerModule,
        MatButtonModule,
        MatRadioModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatTabsModule,
        SpinnerModule,
        MatChipsModule,
        PipeModuleModule,
        NzAlertModule,
        StoreModule.forFeature(LOGS_FEATURE_KEY, logsReducer, {
            initialState: logsInitialState
        }),
        EffectsModule.forFeature([LogsEffects]),
        NzI18nModule,
        NzListModule,
        NzToolTipModule
    ],
  declarations: [LogsComponent],
  exports: [LogsComponent],
  entryComponents: [LogsComponent],
  providers: [LogsFacade, DataPersistence]
})
export class LogsModule {}
