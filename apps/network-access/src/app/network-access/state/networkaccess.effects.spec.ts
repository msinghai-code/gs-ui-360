import { TestBed, async } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/angular';
import { DataPersistence } from '@nrwl/angular';
import { hot } from '@nrwl/angular/testing';

import { NetworkaccessEffects } from './networkaccess.effects';
import {
  LoadAllConfiguration,
  ConfigurationLoaded
} from './networkaccess.actions';

describe('NetworkaccessEffects', () => {
  let actions: Observable<any>;
  let effects: NetworkaccessEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [
        NetworkaccessEffects,
        DataPersistence,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(NetworkaccessEffects);
  });

  describe('loadNetworkaccess$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: new LoadAllConfiguration() });
      expect(effects.loadNetworkaccess$).toBeObservable(
        hot('-a-|', { a: new ConfigurationLoaded([]) })
      );
    });
  });
});
