import { ReactiveFormsModule } from '@angular/forms';
import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NetworkAccessComponent } from './network-access.component';
import {
  GSErrorHandler
} from '@gs/gdk/utils/common';
import { GridModule} from "@gs/gdk/grid";
import { HttpProxyService } from "@gs/gdk/services/http";
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NetworkaccessFacade } from './state/networkaccess.facade';
import { NetworkaccessEffects } from './state/networkaccess.effects';
import { SharedModule } from '../shared/shared.module';
import {
  NETWORKACCESS_FEATURE_KEY,
  initialState as networkaccessInitialState,
  networkaccessReducer
} from './state/networkaccess.reducer';
import { AddEditIPRangeComponent } from '../add-edit-iprange/add-edit-iprange.component';
import { NzModalService } from '@gs/ng-horizon/modal';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { NzI18nModule } from '@gs/ng-horizon/i18n';

const routes: Routes = [{ path: '', component: NetworkAccessComponent }];

@NgModule({
  declarations: [NetworkAccessComponent, AddEditIPRangeComponent],
  imports: [
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature(NETWORKACCESS_FEATURE_KEY, networkaccessReducer, {
      initialState: networkaccessInitialState
    }),
    EffectsModule.forFeature([NetworkaccessEffects]),
    GridModule,
    EnvironmentModule,
    NzI18nModule
  ],
  providers: [
    { provide: ErrorHandler, useClass: GSErrorHandler },
    NetworkaccessFacade,
    NzModalService,
    HttpProxyService
  ],
  entryComponents: [AddEditIPRangeComponent,NzOverlayComponent]
})
export class NetworkAccessModule { }
