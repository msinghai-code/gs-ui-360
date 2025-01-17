import { Component, ElementRef, Inject, Input, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { IActionConfig, IEnv } from '@gs/core';
import { NzIconService } from '@gs/ng-horizon/icon';
import { BionicActionSource } from '@gs/rules/load-to-object';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { RuleActionComponent } from './rule-action/rule-action.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'gs-company-rules-actions',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../ng-horizon.less'],
  encapsulation: ViewEncapsulation.ShadowDom
})

export class AppComponent {

  isReady$ = new BehaviorSubject(false);

  @Input() actionDetails: IActionConfig;
  @Input() ruleDetails;
  @Input() actionSource:BionicActionSource;
  @Input() sourceConfig;
  @Input() source;
  @Input() targetConfig;
  @Input() config;
  @Input() previewMode = false;

  @ViewChild(RuleActionComponent, {static: false}) ruleAction : RuleActionComponent;
  @ViewChild("ruleActionTemplateRef", { static: true }) ruleActionTemplateRef: ElementRef;

  @Input()
  get toSaveJson(): any {
    return this.ruleAction.toSaveJson();
  }

  @Input()
  get getValidationErrors(): any {
    return this.ruleAction.getValidationErrors();
  }

  @Input()
  get hasUnsavedChanges(): any {
    return this.ruleAction.hasUnSavedChanges();
  }

  constructor(
    @Inject("env") public env: IEnv,
    private iconService: NzIconService
  ) {
    this.prepareIconService();
  }

  ngOnInit() {
    this.env.updateConfig(this.env.getGS().userConfig.user, this.env.getGS().userConfig.host, this.env.getGS().userConfig.instance, this.env.getGS().userConfig);
  }

  protected async prepareIconService() {
    if (environment.production) {
      this.iconService.changeAssetsSource(this.env.getGS().cdnPath);
    } else {
      // const urlPath = "https://localhost:4200";  // change your local port into urlPath when you run in local
      // this.iconService.changeAssetsSource(urlPath);
    }
}

  // If we get any input then only we need it.
  ngOnChanges(changes: SimpleChanges): void {
    this.isReady$.next(true);
  }

}
