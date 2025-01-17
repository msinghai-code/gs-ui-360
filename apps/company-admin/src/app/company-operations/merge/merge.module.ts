import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyComponent } from './company/company.component';
import { StoreModule } from '@ngrx/store';
import * as mergeReducer from './store/merge.reducers';
import { EffectsModule } from '@ngrx/effects';
import { MergeEffects } from './store/merge.effets';
import { SpinnerModule } from '@gs/gdk/spinner';
import { FormsModule } from '@angular/forms';
// import { MergeDialogComponent } from './merge-dialog.component';
import { MergeAllowedDialogComponent } from './merge-allowed.component';
import { GSLayoutsModule } from '@gs/gdk/layouts';
import {StepsModule} from 'primeng/steps';
import {
  MatDividerModule,
  MatButtonModule,
  MatRadioModule,
  MatSelectModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatTabsModule,
  MatIconModule
} from '@angular/material';

import { TimelineComponent } from './timeline/timeline.component';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { RouterModule, Route, Router } from '@angular/router';
import { MergeComponent } from './merge.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { PipeModuleModule } from '../pipe-module/pipe-module.module';
import { NzSelectModule } from '@gs/ng-horizon/select';
import {NzI18nModule} from "@gs/ng-horizon/i18n";

import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzListModule } from "@gs/ng-horizon/list";
import { NzCheckboxModule } from "@gs/ng-horizon/checkbox";
import { NzFormModule } from "@gs/ng-horizon/form";
import { NzButtonModule } from "@gs/ng-horizon/button";
import { NzNotificationModule } from "@gs/ng-horizon/notification";

const NGRX_MODULES = [
  StoreModule.forFeature('mergecompany', mergeReducer.reducers),
  EffectsModule.forFeature([MergeEffects])
];

const merge_routes: Route[] = [
  {
    path: '',
    component: MergeComponent,
    children: [
      { path: 'company', component: CompanyComponent },
      { path: 'scorecard', component: ScorecardComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: '**', redirectTo: 'company' }
    ]
  }
];

const MAT_MODULES = [
  MatDividerModule,
  MatButtonModule,
  MatRadioModule,
  MatSelectModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatTabsModule,
  MatIconModule
];

@NgModule({
    imports: [
        CommonModule,
        //RouterModule,
        RouterModule.forChild(merge_routes),
        ...NGRX_MODULES,
        ...MAT_MODULES,
        SpinnerModule,
        FormsModule,
        GSLayoutsModule,
        NzSelectModule,
        StepsModule,
        PipeModuleModule,
        NzI18nModule,
        NzListModule,
        NzRadioModule,
        NzToolTipModule,
        NzCheckboxModule,
        NzFormModule,
        NzButtonModule,
        NzNotificationModule
    ],
  declarations: [
    MergeComponent,
    // MergeDialogComponent,
    CompanyComponent,
    TimelineComponent,
    ScorecardComponent,
    SideNavComponent,
    MergeAllowedDialogComponent
  ],
  exports: [MergeComponent,MergeAllowedDialogComponent],
  entryComponents: [MergeAllowedDialogComponent]
})
export class MergeModule {}
