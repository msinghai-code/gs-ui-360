/**
 * Created by rpal on 2021-02-22
 */
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  NgModule,
  NgZone,
  Injector,
  DoBootstrap,
  ApplicationRef,
  APP_INITIALIZER
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import {
  GSErrorHandler
} from '@gs/gdk/utils/common';
import { OverlayContainerProvider, OVERLAY_NAME_TOKEN, ElementZoneStrategyFactory } from "@gs/gdk/core";
import {
setAppInjector
} from '@gs/report/utils';
import { ContainerModule } from "@gs/gdk/container";
import { getCdnPath } from '@gs/gdk/utils/cdn';
// import { MAT_LABEL_GLOBAL_OPTIONS, MatProgressBarModule, MatSnackBarModule, GestureConfig } from '@angular/material';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { CS360RouteGuard } from "./route-guard";
import { AppRoutingModule } from './app-routing.module';
import {APP_BASE_HREF, LocationStrategy} from '@angular/common';
import { ParameterHashLocationStrategy } from './route-reuse-strategy';
import { CS360CacheService, CS360Service, PxService, Gs404NotFoundModule, CONTEXT_INFO, ExternalAppsService } from '@gs/cs360-lib/src/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { OverlayContainer } from '@angular/cdk/overlay';
import {createCustomElement} from "@angular/elements";
import {WidgetOverlayElementComponent} from "./widget-overlay-element.component";
import { NzIconService } from '@gs/ng-horizon/icon';
import { NzI18nModule,NzTranslationParams, NZ_TRANSLATION_PARAMS_TOKEN } from '@gs/ng-horizon/i18n';
import { getI18nParams} from "@gs/gdk/core"; // @gs/gdk@1.8.4
import { StoreModule} from "@ngrx/store";
import {EnvironmentModule, EnvironmentService} from '@gs/gdk/services/environment';
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { EffectsModule } from '@ngrx/effects';
import { DescribeModule } from '@gs/gdk/services/describe'
import { RouterModule } from '@angular/router';
import { lazyWidgets } from './LazyLoadEntry';
import {LAZY_WIDGETS, LazyLoaderService} from "@gs/gdk/services/lazy";


export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360','reports', 'scorecard-libs','horizon','reports']});
}

export function initializeAppFactory(iconService) {
  const prepareIconService = async () => {
    if (environment.production) {
      const baseUrl = await getCdnPath("cs360"); // window.GS.cdnUrl || window.GS.autonomousUrls['your_module_name']
      iconService.changeAssetsSource(baseUrl);
    } else {
    }
  };

  return () => prepareIconService();
}
@NgModule({
  declarations: [
    AppComponent,
    WidgetOverlayElementComponent
  ],
  imports: [
    ContainerModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot([]),
    RouterModule.forRoot([]),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    !environment.production ? [StoreDevtoolsModule.instrument({ maxAge: 25 })] : [],
    // Angular Material Modules
    // MatSnackBarModule,
    // MatProgressBarModule,
    FlexLayoutModule,
    NzEmptyModule,
    NzTypographyModule,
    Gs404NotFoundModule,
    NzI18nModule.forRoot(),
      DescribeModule,
      EnvironmentModule,
      NzNotificationModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [NzIconService],
      multi: true
    },
    {
        provide: NZ_TRANSLATION_PARAMS_TOKEN,
        useFactory: i18nParamFactory
    },
    { provide: APP_BASE_HREF, useValue: '/' },
    {provide: 'envService', useClass: EnvironmentService},
    { provide: 'CONTEXT_INFO', useValue: CONTEXT_INFO },
    // { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'auto' } },
    { provide: ErrorHandler, useClass: GSErrorHandler },
    // { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    {provide: OverlayContainer, useClass:OverlayContainerProvider},
    { provide: OVERLAY_NAME_TOKEN, useValue: 'gs-360-overlay' },
    LazyLoaderService,
    {provide: LAZY_WIDGETS, useValue: lazyWidgets},
    CS360RouteGuard,
    CS360Service,
    CS360CacheService,
    PxService,
    ExternalAppsService,
    { provide: LocationStrategy, useClass: ParameterHashLocationStrategy }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent, WidgetOverlayElementComponent],
})
export class AppModule {
  constructor(private nzZone: NgZone,private injector: Injector) {
    (window as any).ngZone = this.nzZone;
    setAppInjector(injector);
   // this.registerElements();
  }

  readonly customElementsMap = {
    'gs-root': AppComponent,
    'gs-360-overlay': WidgetOverlayElementComponent
  }

  private registerElements(){
    for(const ele in this.customElementsMap){
      const strategyFactory = new ElementZoneStrategyFactory(this.customElementsMap[ele], this.injector);
      const customElement = createCustomElement(this.customElementsMap[ele], { injector: this.injector, strategyFactory });
      customElements.define(ele, customElement);
    }
  }

  ngDoBootstrap(appRef: ApplicationRef): void {
  }


}
