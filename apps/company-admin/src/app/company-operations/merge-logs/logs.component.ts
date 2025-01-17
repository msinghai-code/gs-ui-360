import {Component, EventEmitter, Input, OnDestroy, OnInit} from '@angular/core';
import { MergeConfig, Log } from './pojo/log';
import { LogsFacade } from './state/logs.facade';
import { takeUntil } from 'rxjs/operators';
import { Subject, Observable, timer } from 'rxjs';
import { MERGE_JOB_STATUS, LOG_CONSTANTS, RUN_TYPE } from './logs.constants';
import { size, forEach, keys, isUndefined } from 'lodash';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnDestroy, OnInit {
  @Input() data;
  notifier?: EventEmitter<any>;
  //{360.logs_comp.ok}=Ok
  actions?: any[] = [{ label: this.i18nService.translate('360.logs_comp.ok'), value: 'OK' }];

  loaded: Observable<boolean>;
  mergeConfigs: Observable<Array<MergeConfig>>;
  selectedMergeConfig: MergeConfig;
  componentSubscription: any = new Subject<void>();
  runType: any = RUN_TYPE;
  mergeJobStatus: any = MERGE_JOB_STATUS;
  userLocale: any;
  timerSubscription: any;
  dismissedMerges = {};
  companies = [];
  pageBannerMsg = "x modules failed during merge.";
  // pageBannerInfo = {show : true , actionButtons: ["Rerun", "Dismiss"], message : 'x modules failed during merge.', type: 'error' };
    bannerActions = [
        {
            label: this.i18nService.translate('360.logs_comp.rerun')
        },
        {
            label: this.i18nService.translate('360.logs_comp.dismiss')
        }
    ];

  constructor(private logsFacade: LogsFacade, private i18nService: NzI18nService) {
    this.mergeConfigs = this.logsFacade.mergeConfigs$;
    this.loaded = this.logsFacade.loaded$;
    this.userLocale = window['GS'] && window['GS'].userConfig && window['GS'].userConfig.userLocale;
  }

  ngOnInit() {
    this.subscribeForMergeConfig();
      this.updateData(this.data);
  }

  subscribeForMergeConfig() {
    this.logsFacade.selectedMergeConfig$.pipe(takeUntil(this.componentSubscription)).subscribe(config => {
      this.selectedMergeConfig = config;
      if(this.selectedMergeConfig) {
        if(isUndefined(this.dismissedMerges[this.selectedMergeConfig.mergeId])) {
          this.dismissedMerges[this.selectedMergeConfig.mergeId] = false;
        }
        this.pageBannerMsg = this.selectedMergeConfig.failedModules + this.i18nService.translate('360.logs_comp.moduleFailed');
        this.companies = [];
        if(this.selectedMergeConfig.mergeDetails) {
          forEach(keys(this.selectedMergeConfig.mergeDetails), key => {
            this.companies.push({
              name: this.selectedMergeConfig.mergeDetails[key],
              info: "GSID: " + key
            });
          });
        } else if(size(this.selectedMergeConfig.mergeCompanies)) {
          forEach(this.selectedMergeConfig.mergeCompanies, company => {
            this.companies.push({
              name: company,
              info: null
            });
          });
        }
      }
      if (this.timerSubscription)
        this.timerSubscription.unsubscribe();
      this.subscribeForAutoRefresh();
    });
  }

  onRetriggerAction(clickedAction: any) {
    switch(clickedAction.label.toUpperCase()) {
      case "RERUN" : 
        this.logsFacade.retriggerMerge(this.selectedMergeConfig.mergeId); 
        this.dismissedMerges[this.selectedMergeConfig.mergeId] = true; 
        break;
      case "DISMISS": this.dismissedMerges[this.selectedMergeConfig.mergeId] = true; break;
    }
  }

  subscribeForAutoRefresh() {
    const refreshInterval = timer(LOG_CONSTANTS.POLLING_INTERVAL, LOG_CONSTANTS.POLLING_INTERVAL);
    this.timerSubscription = refreshInterval.pipe(takeUntil(this.componentSubscription)).subscribe(t => {
      if (this.selectedMergeConfig && (this.selectedMergeConfig.jobStatus === MERGE_JOB_STATUS.PROCESSING || this.selectedMergeConfig.jobStatus === MERGE_JOB_STATUS.RECEIVED)) {
        this.loadLogsByMergeId(this.selectedMergeConfig.mergeId);
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  getMergeConfigs(mergeId: string) {
    this.logsFacade.loadMergeConfig(mergeId);
  }

  loadLogsByMergeId(mergeId: string) {
    this.logsFacade.loadLogsByMergeId(mergeId);
  }

  onConfigSelect(config: MergeConfig) {
    this.selectedMergeConfig = config;
    this.loadLogsByMergeId(config.mergeId);
  }

  updateData(data: any) {
    const mergeId = data.mergeId;
    this.getMergeConfigs(mergeId);
  }
  execute(action: any, ...args: any[]) { return true; }

  ngOnDestroy(): void {
    this.componentSubscription.next();
    this.componentSubscription.complete();
  }

}
