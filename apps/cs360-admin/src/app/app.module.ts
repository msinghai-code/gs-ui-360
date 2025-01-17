import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
    EnvConf
} from '@gs/core';
import { FeatureDisabledModule, FeatureDisabledComponent, CS360AdminRolloutGuard} from "@gs/cs360-lib/src/admin";
import {
  GSErrorHandler,
} from '@gs/gdk/utils/common';
import {
    setAppInjector
} from '@gs/core';
import { DescribeModule } from "@gs/gdk/services/describe";
import { ContainerModule } from "@gs/gdk/container";
import { environment } from 'src/environments/environment';
import { GestureConfig, MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { CS360AdminRouteGuard } from './route-guard';
import { CS360Service, ADMIN_CONTEXT_INFO, CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CommonModule } from '@angular/common';
import { NzI18nModule, NzTranslationParams, NZ_TRANSLATION_PARAMS_TOKEN } from "@gs/ng-horizon/i18n";
import { NZ_CONFIG } from "@gs/ng-horizon/core";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material';
import { getI18nParams } from "@gs/gdk/core";
import { NzIconModule, NzIconService} from "@gs/ng-horizon/icon";
import {getCdnPath} from "@gs/gdk/utils/cdn";
import {NzMessageModule, NzMessageService} from "@gs/ng-horizon/message";
import {CurrencyService, EnvironmentService, UserService} from "@gs/gdk/services/environment";
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { FilterQueryBuilderModule } from '@gs/gdk/filter/builder';
import {StoreModule} from "@ngrx/store";
import {EffectsModule} from "@ngrx/effects";
import { lazyWidgets } from './LazyLoadEntry';
import {LAZY_WIDGETS, LazyLoaderService} from "@gs/gdk/services/lazy";
import { GridCellRenderersModule } from "@gs/gdk/grid"

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./layout-configuration/layout-configuration.module').then(m => m.LayoutConfigurationModule),
    canActivate: [CS360AdminRouteGuard]
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
    return getI18nParams({moduleNames: [ '360','scorecard-libs', 'horizon','reports']});
}

export function initializeAppFactory(iconService) {
  const prepareIconService = async () => {
    if (environment.production) {
      const baseUrl = await getCdnPath("cs360-admin"); // window.GS.cdnUrl || window.GS.autonomousUrls['your_module_name']
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
    !environment.production ? [StoreDevtoolsModule.instrument({ maxAge: 25 })] : [],
    MatSnackBarModule,
    NzMessageModule,
    NzIconModule,
    NzI18nModule.forRoot(),
    NzNotificationModule,
      EnvironmentModule,
      FilterQueryBuilderModule,
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
      DescribeModule,
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
    {provide: 'env', useClass: EnvConf},
    {provide: 'envService', useClass: EnvironmentService},
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    { provide: 'ADMIN_CONTEXT_INFO', useValue: ADMIN_CONTEXT_INFO },
    { provide: 'CONTEXT_INFO', useValue:  CONTEXT_INFO },
    { provide: NZ_CONFIG, useValue: { notification: { nzPlacement: 'bottomLeft' } } },
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'auto' } },
    LazyLoaderService,
    {provide: LAZY_WIDGETS, useValue: lazyWidgets},
    { provide: ErrorHandler, useClass: GSErrorHandler },
    {
          provide: NZ_TRANSLATION_PARAMS_TOKEN,
          useFactory: i18nParamFactory
    },
    NzMessageService,
    CS360Service,
    CS360AdminRouteGuard,
    CS360AdminRolloutGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    setAppInjector(injector);
  }
}
