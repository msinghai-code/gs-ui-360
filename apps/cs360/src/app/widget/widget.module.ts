import {ApplicationRef, APP_INITIALIZER, DoBootstrap, Injector, NgModule, NgModuleRef, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {LandingModule} from "../landing/landing.module";
import {RouterModule} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";
import { SpinnerModule } from "@gs/gdk/spinner";
import { OverlayContainerProvider, OVERLAY_NAME_TOKEN, ElementZoneStrategyFactory } from "@gs/gdk/core";
import {createCustomElement} from "@angular/elements";
import {CONTEXT_INFO, CS360Service, Gs404NotFoundModule} from "@gs/cs360-lib/src/common";
import {WidgetWrapperComponent} from "./widget-wrapper/widget-wrapper.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { WidgetOverlayElementComponent } from './widget-overlay-element.component';
import {APP_BASE_HREF} from '@angular/common';
import { NzIconService } from '@gs/ng-horizon/icon';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NZ_TRANSLATION_PARAMS_TOKEN, NzI18nModule, NzTranslationParams} from '@gs/ng-horizon/i18n';
import {getI18nParams} from "@gs/gdk/core";
import { HttpProxyModule } from '@gs/gdk/services/http';
import {LAZY_WIDGETS, LazyLoaderService} from "@gs/gdk/services/lazy";
// import {lazyWidgets} from "@gs/cs360-lib/src/csm-sections/services/LazyLoadEntry";
import {EnvConf, setAppInjector} from "@gs/core";
import {GSErrorHandler} from "@gs/gdk/utils/common";
import {CS360RouteGuard} from "../route-guard";
import {CS360LandingRouteGuard} from "../landing/landing.guard";
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { CsmWidgetsModule } from '@gs/cs360-lib/src/csm';
import { lazyWidgets } from '../LazyLoadEntry';
import {NzEmptyModule} from "@gs/ng-horizon/empty";
// import {CsmWidgetsModule} from "@gs/cs360-lib/src/widgets/csm-widgets/csm-widgets.module";

export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360','scorecard-libs','horizon', 'reports']});
}

export function initializeServices(iconService:NzIconService){
  return () => new Promise(async (s, r) => {
    const path = await getCdnPath("cs360-widget");
    iconService.changeAssetsSource(path);
    s(true);
  });
}
@NgModule({
  declarations: [
    WidgetWrapperComponent,
    WidgetOverlayElementComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LandingModule,
    RouterModule.forRoot([]),
    SpinnerModule,
    HttpProxyModule,
    NzI18nModule.forRoot(),
    NzNotificationModule,
    CsmWidgetsModule,
    NzEmptyModule,
    Gs404NotFoundModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeServices,
      deps: [NzIconService],
      multi: true
    },
    {
      provide: NZ_TRANSLATION_PARAMS_TOKEN,
      useFactory: i18nParamFactory
    },
    {provide: 'env', useClass: EnvConf},
    { provide: CONTEXT_INFO, useValue: CONTEXT_INFO },
    { provide: OverlayContainer, useClass: OverlayContainerProvider },
    { provide: OVERLAY_NAME_TOKEN, useValue: 'gs-cs360-widget-overlay' },
    { provide: APP_BASE_HREF, useValue: '/' },
    {provide: 'envService', useClass: EnvironmentService},
    LazyLoaderService,
    {provide: LAZY_WIDGETS, useValue: lazyWidgets},
    { provide: ErrorHandler, useClass: GSErrorHandler },
    CS360RouteGuard,
    CS360Service,
    CS360LandingRouteGuard
  ],
  entryComponents: [WidgetWrapperComponent, WidgetOverlayElementComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WidgetModule implements DoBootstrap {
  constructor(private injector: Injector, private module: NgModuleRef<WidgetModule>) {
    this.registerElements();
    setAppInjector(injector);
  }
  readonly customElementsMap = {
    'gs-cs360-widget': WidgetWrapperComponent,
    'gs-cs360-widget-overlay': WidgetOverlayElementComponent
  };

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
