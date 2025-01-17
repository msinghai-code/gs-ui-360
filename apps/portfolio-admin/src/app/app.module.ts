import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { OverlayContainerProvider, OVERLAY_NAME_TOKEN, ElementZoneStrategyFactory } from "@gs/gdk/core";
import {appConfig, AppConfigEffects, globalMessage, setAppInjector, EnvConf} from '@gs/core';
import { SharedModule } from '@gs/core/src/shared/src/lib/formula-field-builder/shared.module';
import {NZ_TRANSLATION_PARAMS_TOKEN, NzI18nModule, NzTranslationParams} from '@gs/ng-horizon/i18n';
import { EffectsModule } from '@ngrx/effects';
import { PortfolioAdminWidgetModule } from './portfolio-admin-widget/portfolio-admin-widget.module';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { OverlayContainer } from '@angular/cdk/overlay';
import { createCustomElement } from '@angular/elements';
import { PortfolioAdminOverlayElementComponent } from './portfolio-admin-overlay.component';
import {getI18nParams} from "@gs/gdk/core";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { DescribeModule } from '@gs/gdk/services/describe';
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { GridFloatingFiltersModule } from "@gs/gdk/grid";

export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360','scorecard-libs', 'horizon']});
}

@NgModule({
  declarations: [
    AppComponent,
    PortfolioAdminOverlayElementComponent
  ],
  imports: [
    BrowserModule,
    EffectsModule.forRoot([AppConfigEffects]),
    StoreModule.forRoot({ appConfig, globalMessage }, { runtimeChecks: { strictStateImmutability: false, strictActionImmutability: false } }),
    NzI18nModule.forRoot(),
    NzIconModule,
    PortfolioAdminWidgetModule,
    SharedModule,
    DescribeModule,
    NzNotificationModule,
    GridFloatingFiltersModule
  ],
  providers: [
    {provide: OverlayContainer, useClass: OverlayContainerProvider},
    {provide: 'env', useClass: EnvConf},
    {provide: 'envService', useClass: EnvironmentService},
    { provide: OVERLAY_NAME_TOKEN, useValue: 'gs-portfolio-admin-overlay' },
    {
        provide: NZ_TRANSLATION_PARAMS_TOKEN,
        useFactory: i18nParamFactory
    }
  ],
  entryComponents: [AppComponent, PortfolioAdminOverlayElementComponent],
})
export class AppModule implements DoBootstrap { 
  readonly customElementsMap = {
    'gs-portfolio-admin': AppComponent,
    'gs-portfolio-admin-overlay': PortfolioAdminOverlayElementComponent
  }

constructor(private injector: Injector) {
    this.registerElements();
    setAppInjector(injector);
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
