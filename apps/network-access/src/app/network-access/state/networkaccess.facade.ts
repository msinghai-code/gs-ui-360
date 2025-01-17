import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NetworkaccessPartialState } from './networkaccess.reducer';
import { networkaccessQuery } from './networkaccess.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { NetworkaccessActionTypes, LoadAllConfiguration, UpsertConfiguration } from './networkaccess.actions';

@Injectable()
export class NetworkaccessFacade {
  globalMesssage$ = this.store.select((state) => { return state['globalMessage'] });
  loaded$ = this.store.pipe(select(networkaccessQuery.getLoaded));
  allIPRange$ = this.store.pipe(select(networkaccessQuery.getAllConfiguration));
  getConfiguration$ = this.store.pipe(select(networkaccessQuery.getConfiguration));
  ipRangeAdded$ = this.actions.pipe(ofType(NetworkaccessActionTypes.ConfigurationUpserted));

  constructor(private store: Store<NetworkaccessPartialState>, private actions: Actions) {
    this.ipRangeAdded$.subscribe(x => { this.loadAll() });
  }

  loadAll() {
    this.store.dispatch(new LoadAllConfiguration());
  }

  upsertConfiguration(value) {
    this.store.dispatch(new UpsertConfiguration(value));
  }

  // updateModuleTitle(title) {
  //   this.store.dispatch(new UpdateModuleTitle({ label: title }));
  // }
}
