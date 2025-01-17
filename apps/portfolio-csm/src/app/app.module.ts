import { BrowserModule } from '@angular/platform-browser';
import { NgModule, DoBootstrap, ApplicationRef, Injector } from '@angular/core';
// import {setAppInjector, EnvConf} from '@gs/core';
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { OverlayContainerProvider, OVERLAY_NAME_TOKEN, ElementZoneStrategyFactory } from "@gs/gdk/core";
import { AppComponent } from './app.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import {NZ_TRANSLATION_PARAMS_TOKEN, NzI18nModule, NzTranslationParams} from '@gs/ng-horizon/i18n';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortfolioCsmWidgetModule } from './portfolio-csm-widget/portfolio-csm-widget.module';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { createCustomElement } from "@angular/elements";
import { PortfolioCsmOverlayElementComponent } from './portfolio-csm-overlay.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { DescribeModule } from '@gs/gdk/services/describe'
import { getI18nParams } from '@gs/gdk/core';
import { GridFloatingFiltersModule } from "@gs/gdk/grid";

export function i18nParamFactory(): NzTranslationParams {
    return getI18nParams({moduleNames: ['360', 'scorecard-libs','horizon']});
}

@NgModule({
  declarations: [
    AppComponent,
    PortfolioCsmOverlayElementComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NzNotificationModule,
    PortfolioCsmWidgetModule,
    NzIconModule,
    DescribeModule,
    GridFloatingFiltersModule,
    EffectsModule.forRoot([]),
    StoreModule.forRoot({}, { runtimeChecks: { strictStateImmutability: false, strictActionImmutability: false } }),
    NzI18nModule.forRoot()
  ],
  providers: [
    {provide: OverlayContainer, useClass: OverlayContainerProvider},
    { provide: OVERLAY_NAME_TOKEN, useValue: 'gs-portfolio-csm-overlay' },
      {provide: 'env', useClass: EnvironmentService},
    {provide: 'envService', useClass: EnvironmentService},
    {
      provide: NZ_TRANSLATION_PARAMS_TOKEN,
      useFactory: i18nParamFactory
    }
  ],
  entryComponents: [AppComponent, PortfolioCsmOverlayElementComponent],
})
export class AppModule implements DoBootstrap {
  readonly customElementsMap = {
    'gs-portfolio-csm':AppComponent,
    'gs-portfolio-csm-overlay': PortfolioCsmOverlayElementComponent
  }

  constructor(private injector: Injector) {
    this.registerElements();
    // setAppInjector(injector);
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
