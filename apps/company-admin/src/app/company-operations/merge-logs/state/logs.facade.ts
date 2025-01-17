import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { LogsPartialState } from './logs.reducer';
import { logsQuery } from './logs.selectors';
import {  LoadMergeConfig, LoadLogsByMergeId, MergeRetrigger } from './logs.actions';

@Injectable()
export class LogsFacade {
  loaded$ = this.store.pipe(select(logsQuery.getLoaded));
  mergeConfigs$ = this.store.pipe(select(logsQuery.getMergeConfigs));
  selectedMergeConfig$ = this.store.pipe(select(logsQuery.getSelectedMergeConfig));
  mergeRetriggered$ = this.store.pipe(select(logsQuery.getSelectedMergeConfig));

  constructor(private store: Store<LogsPartialState>) { }

  loadLogsByMergeId(mergeId: string) {
    this.store.dispatch(new LoadLogsByMergeId(mergeId));
  }

  loadMergeConfig(mergeId: string) {
    this.store.dispatch(new LoadMergeConfig(mergeId));
  }

  retriggerMerge(mergeId : string) {
    this.store.dispatch(new MergeRetrigger(mergeId));
  }
}
