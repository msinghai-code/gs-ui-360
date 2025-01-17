import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule} from '@angular/router';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { EffectsModule} from '@ngrx/effects';
import { StoreModule} from '@ngrx/store';
import { AppComponent } from './app.component';
import { ContainerModule } from "@gs/gdk/container";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvConf} from '@gs/core';
import { GSLayoutsModule } from '@gs/gdk/layouts';
import { MAT_LABEL_GLOBAL_OPTIONS, DateAdapter } from '@angular/material';
import { CompanyOperationsModule } from './company-operations/company-operations.module';
import { NzTimePickerModule } from '@gs/ng-horizon/time-picker';
import { NZ_TRANSLATION_PARAMS_TOKEN, NzI18nModule, NzTranslationParams } from '@gs/ng-horizon/i18n';
import { getI18nParams } from "@gs/gdk/core"; // @gs/gdk@1.8.4
import { environment } from '../environments/environment';
import { NzIconService } from '@gs/ng-horizon/icon';
import {Injector} from '@angular/core';
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import {EnvironmentModule, EnvironmentService} from "@gs/gdk/services/environment";
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { DescribeModule } from '@gs/gdk/services/describe';
import { setAppInjector} from '@gs/core';

export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360', 'scorecard-libs', 'horizon']});
}


export function initializeAppFactory(iconService) {
  const prepareIconService = async () => {
    if (environment.production) {
      const baseUrl = await getCdnPath("company-admin");
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
    GSLayoutsModule,
    BrowserAnimationsModule,
    ContainerModule,
    HttpClientModule,
    RouterModule.forRoot([], {useHash: true}),
    CompanyOperationsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    NzTimePickerModule,
    NzI18nModule.forRoot(),
    NzNotificationModule,
    NzPopoverModule,
    EnvironmentModule,
    DescribeModule
  ],
  providers: [
    {provide: 'env', useClass: EnvConf},
    {provide: 'envService', useClass: EnvironmentService},
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'always' } },
     {
          provide: NZ_TRANSLATION_PARAMS_TOKEN,
          useFactory: i18nParamFactory
      },
      {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [NzIconService],
      multi: true
    }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(injector: Injector) {
    setAppInjector(injector);
}
}
