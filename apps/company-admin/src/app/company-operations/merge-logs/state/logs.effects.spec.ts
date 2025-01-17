import { TestBed, async } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/angular';
import { DataPersistence } from '@nrwl/angular';
import { hot } from '@nrwl/angular/testing';

import { LogsEffects } from './logs.effects';
import { LoadLogs, LogsLoaded } from './logs.actions';

describe('LogsEffects', () => {
  let actions: Observable<any>;
  let effects: LogsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [
        LogsEffects,
        DataPersistence,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(LogsEffects);
  });

  describe('loadLogs$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: new LoadLogs() });
      expect(effects.loadLogs$).toBeObservable(
        hot('-a-|', { a: new LogsLoaded([]) })
      );
    });
  });
});
