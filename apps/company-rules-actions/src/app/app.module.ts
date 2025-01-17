import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, DoBootstrap, Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CompanyRulesActionsOverlayElementComponent } from './company-rules-actions-overlay.component';
import { EnvConf, GSSpinnerModule } from '@gs/core';
import { createCustomElement} from "@angular/elements";
import { OverlayContainer } from '@angular/cdk/overlay';
import {NzInputModule} from "@gs/ng-horizon/input";
import { RuleActionComponent } from './rule-action/rule-action.component';
import { FlexModule } from "@angular/flex-layout";
import { NzFormModule } from "@gs/ng-horizon/form";
import { ActionHeaderComponent, FieldMapperWrapperComponent, LoadToObjectActionModule, LoadToObjectService } from '@gs/rules/load-to-object';
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { CommonModule } from '@angular/common';
import { FieldMapperModule } from '@gs/gdk/field-mapper';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { RuleActionHeaderComponent } from './rule-action-header/rule-action-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { CompanyRulesOverlayProvider } from './company-rules-overlay.provider';
import {ElementZoneStrategyFactory, getI18nParams, OVERLAY_NAME_TOKEN} from '@gs/gdk/core';
import { FeatureFlagService } from '@gs/gdk/services/feature-flag';
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";
import {TranslocoModule} from "@ngneat/transloco";
import {NZ_TRANSLATION_PARAMS_TOKEN, NzI18nModule, NzTranslationParams} from "@gs/ng-horizon/i18n";

export function i18nParamFactory(): NzTranslationParams {
  if( (window as any).GS.userConfig ){
    (window as any).GS.userConfig.languageCode = 'en';
  }
  return getI18nParams({moduleNames: ['horizon']});
}

@NgModule({
  declarations: [
    AppComponent,
    CompanyRulesActionsOverlayElementComponent,
    RuleActionComponent,
    RuleActionHeaderComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    NzNotificationModule,
    GSSpinnerModule,
    ReactiveFormsModule,
    NzToolTipModule,
    NzDrawerModule,
    FlexModule,
    NzSelectModule,
    NzFormModule,
    LoadToObjectActionModule,
    FieldMapperModule,
    NzDropDownModule,
    NzRadioModule,
    FormsModule,
    NzCheckboxModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzI18nModule.forRoot(),
    TranslocoModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    LoadToObjectService,
    FeatureFlagService,
    { provide: 'env', useClass: EnvConf },
    {provide: OverlayContainer, useClass:CompanyRulesOverlayProvider},
    { provide: OVERLAY_NAME_TOKEN, useValue: 'gs-company-rules-actions-overlay' },
    {
      provide: NZ_TRANSLATION_PARAMS_TOKEN,
      useFactory: i18nParamFactory
    }
  ],
  entryComponents: [AppComponent, CompanyRulesActionsOverlayElementComponent, RuleActionHeaderComponent,
    ActionHeaderComponent, FieldMapperWrapperComponent],
})
export class AppModule implements DoBootstrap {
  readonly customElementsMap = {
    'gs-company-rules-actions': AppComponent,
    'gs-company-rules-actions-overlay': CompanyRulesActionsOverlayElementComponent
  }

  constructor(private injector: Injector) {
    this.registerElements();
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
