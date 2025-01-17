import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Route, RouterModule } from '@angular/router';
import { DateAdapter, MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
   globalMessage,
  GsDateAdapter,
  EnvConf,
  appConfig,
  AppConfigEffects,
} from '@gs/core';
import {
  GSErrorHandler
} from '@gs/gdk/utils/common';
import { ContainerModule } from "@gs/gdk/container";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NetworkaccessFacade } from './network-access/state/networkaccess.facade';
import {NZ_TRANSLATION_PARAMS_TOKEN, NzI18nModule, NzTranslationParams} from "@gs/ng-horizon/i18n";
import {getI18nParams} from "@gs/gdk/core";
import { NzIconService } from "@gs/ng-horizon/icon";
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import {NzPopoverModule} from "@gs/ng-horizon/popover";
import {NzModalControlService, NzModalService, NzModalModule} from '@gs/ng-horizon/modal';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { DescribeModule } from '@gs/gdk/services/describe'


const app_routes: Route[] = [
  {
    path: '',
    loadChildren: () => import ('./network-access/network-access.module')
    .then(m => m.NetworkAccessModule)
  }
];

export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360','scorecard-libs','horizon']});
}

export function initializeAppFactory(iconService) {
  const prepareIconService = async () => {
    if (environment.production) {
      const baseUrl = await getCdnPath("network-access");
      iconService.changeAssetsSource(baseUrl);
    } else {
    }
  };

  return () => prepareIconService();
}
@NgModule({
  imports: [
    ContainerModule,
    BrowserModule,
    NzI18nModule.forRoot(),
    NzPopoverModule,
      NzModalModule,
    BrowserAnimationsModule,
    NzNotificationModule,
    StoreModule.forRoot({ appConfig, globalMessage }, { runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true }}),
    EffectsModule.forRoot([AppConfigEffects]),
    RouterModule.forRoot(app_routes, {
      initialNavigation: 'enabled',
      useHash: true
    }),
    !environment.production
      ? [StoreDevtoolsModule.instrument({ maxAge: 25 })]
      : [],
    SharedModule,
    DescribeModule

  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [NzIconService],
      multi: true
    },
    NetworkaccessFacade,
    { provide: DateAdapter, useClass: GsDateAdapter },
      {provide: 'env', useClass: EnvConf},
    {provide: 'envService', useClass: EnvironmentService},
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'auto' } },
    { provide: ErrorHandler, useClass: GSErrorHandler },
      {
          provide: NZ_TRANSLATION_PARAMS_TOKEN,
          useFactory: i18nParamFactory
      },
    NzModalControlService,
      NzModalService
  ],
    entryComponents: [NzOverlayComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
