import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  setAppInjector,
  EnvConf
} from '@gs/core';
import { FeatureDisabledModule, FeatureDisabledComponent, CS360AdminRolloutGuard } from "@gs/cs360-lib/src/admin";
import {
  GSErrorHandler
} from '@gs/gdk/utils/common';
import { DescribeService } from "@gs/gdk/services/describe";
import { ContainerModule } from "@gs/gdk/container";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { environment } from 'src/environments/environment';
import { GestureConfig, MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NZ_I18N } from "@gs/ng-horizon/i18n";
import { NZ_CONFIG } from "@gs/ng-horizon/core";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material';
import { ADMIN_CONTEXT_INFO, CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { R360AdminRouteGuard } from './route-guard';
import { NzI18nModule, NzTranslationParams, NZ_TRANSLATION_PARAMS_TOKEN} from "@gs/ng-horizon/i18n";
import {getI18nParams} from "@gs/gdk/core";
import { NzIconService } from '@gs/ng-horizon/icon';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { DescribeModule } from '@gs/gdk/services/describe';
import { lazyWidgets } from './LazyLoadEntry';
import {LAZY_WIDGETS, LazyLoaderService} from "@gs/gdk/services/lazy";
import {GridCellRenderersModule} from "@gs/gdk/grid";

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./layout-configuration/layout-configuration.module').then(m => m.LayoutConfigurationModule),
    canActivate: [R360AdminRouteGuard]
  },
  {
    path: 'admin-rollout',
    loadChildren: () => import('@gs/cs360-lib/src/admin/rollout-c360/rollout-c360.module').then(m => m.RolloutC360Module),
    canActivate: [CS360AdminRolloutGuard]
  },
  { path: 'error', component: FeatureDisabledComponent },
  { path: 'feature-disabled', component: FeatureDisabledComponent }
];

export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360','scorecard-libs', 'horizon','reports']});
}

export function initializeAppFactory(iconService) {
  const prepareIconService = async () => {
    if (environment.production) {
      const baseUrl = await getCdnPath("r360-admin"); // window.GS.cdnUrl || window.GS.autonomousUrls['your_module_name']
      iconService.changeAssetsSource(baseUrl);
    } else {
    }
  };

  return () => prepareIconService();
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ContainerModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', useHash: true }),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    !environment.production ? [StoreDevtoolsModule.instrument({ maxAge: 25 })] : [],
    MatSnackBarModule,
    NzNotificationModule,
    DescribeModule,
    NzI18nModule.forRoot(),
    FeatureDisabledModule,
    GridCellRenderersModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [NzIconService],
      multi: true
    },
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    { provide: 'ADMIN_CONTEXT_INFO', useValue: ADMIN_CONTEXT_INFO },
      {provide: 'env', useClass: EnvConf},
    {provide: 'envService', useClass: EnvironmentService},
    { provide: 'CONTEXT_INFO', useValue:  CONTEXT_INFO },
    { provide: NZ_CONFIG, useValue: { notification: { nzPlacement: 'bottomLeft' } } },
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'auto' } },
    { provide: ErrorHandler, useClass: GSErrorHandler },
    {
      provide: NZ_TRANSLATION_PARAMS_TOKEN,
      useFactory: i18nParamFactory
    },
    LazyLoaderService,
    {provide: LAZY_WIDGETS, useValue: lazyWidgets},
    DescribeService,
    R360AdminRouteGuard,
    CS360AdminRolloutGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    setAppInjector(injector);
  }
}
