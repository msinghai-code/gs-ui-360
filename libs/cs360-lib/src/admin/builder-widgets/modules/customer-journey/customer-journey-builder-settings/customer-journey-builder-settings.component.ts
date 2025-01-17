import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild, ElementRef, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import { SummaryConfigurationService } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { SummaryWidget } from '@gs/cs360-lib/src/common';
import { ActivatedRoute} from '@angular/router';
import { fromEvent, Subject } from "rxjs";
import { NzNotificationService } from '@gs/ng-horizon/notification';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';


@Component({
  selector: 'gs-customer-journey-builder-settings',
  templateUrl: './customer-journey-builder-settings.component.html',
  styleUrls: ['./customer-journey-builder-settings.component.scss']
})

export class CustomerJourneySettingsComponent extends BaseWidgetComponent   implements OnInit,OnChanges {


  elementTag = 'gs-customer-journey-settings';
  url: string;
  moduleConfig;
  widgetItem: SummaryWidget;
  data: any;
  
  @ViewChild("customerJourneySettings", {static: false}) customerJourneySettings;
  $destroy = new Subject();

  constructor(private fb: FormBuilder, private summaryConfigrationService: SummaryConfigurationService,@Inject("envService") public env: EnvironmentService,private route: ActivatedRoute, private ele:ElementRef, private notification: NzNotificationService,
  @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO) {
    super();
  }

  async ngOnInit() {
    this.buildOptions();
    this.data = this.widgetItem.config;
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['timeline-customerjourney'] : (await getCdnPath('timeline-customerjourney'));
    // this.url = "https://localhost:4201/main.js";
    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
      // this.changes.emit({ widgetItem: this.widgetItem, type: 'DISABLE_SETTINGS_SAVE', value: true});
    this.changes.emit({ type: 'DISABLE_SETTINGS_SAVE',payload: this.widgetItem});
    this.monitorSaveBtnStatus();
  }



  monitorSaveBtnStatus() {
    fromEvent(window, 'CJ_CONFIGURATION_INITIALIZED')
    .pipe(takeUntil(this.$destroy))
    .subscribe(res => {
      // this.changes.emit({ widgetItem: this.widgetItem, type: 'DISABLE_SETTINGS_SAVE', value: false});
      this.changes.emit({type: 'DISABLE_SETTINGS_SAVE', payload: this.widgetItem});
    });
  }


  toJSON() {
    return this.customerJourneySettings.nativeElement.getSourceDetails;
  }
  

  protected getTimelineRenderConfig() {
    const contexts = [
			{
        rId : this.ctx.relationshipTypeId,
				pageContext:this.ctx.pageContext,
        label:this.widgetItem.label,
        itemId: this.widgetItem.itemId
			}
		];
		return {
      meta:{
        contexts: contexts,
      }
		};
	}

  buildOptions() {
    this.moduleConfig=this.getTimelineRenderConfig();
  }

  ngOnDestroy(): void {
    if(this.$destroy) {
      this.$destroy.next();
      this.$destroy.complete();
    }
  }

}
