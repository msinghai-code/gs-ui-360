import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFirst } from '@nrwl/angular/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';

import { NxModule } from '@nrwl/angular';

import { LogsEffects } from './logs.effects';
import { LogsFacade } from './logs.facade';

import { logsQuery } from './logs.selectors';
import { LoadLogs, LogsLoaded } from './logs.actions';
import { LogsState, Entity, initialState, logsReducer } from './logs.reducer';

interface TestSchema {
  logs: LogsState;
}

describe('LogsFacade', () => {
  let facade: LogsFacade;
  let store: Store<TestSchema>;
  let createLogs;

  beforeEach(() => {
    createLogs = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature('logs', logsReducer, { initialState }),
          EffectsModule.forFeature([LogsEffects])
        ],
        providers: [LogsFacade]
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule
        ]
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.get(Store);
      facade = TestBed.get(LogsFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async done => {
      try {
        let list = await readFirst(facade.allLogs$);
        let isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(0);
        expect(isLoaded).toBe(false);

        facade.loadAll();

        list = await readFirst(facade.allLogs$);
        isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(0);
        expect(isLoaded).toBe(true);

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    /**
     * Use `LogsLoaded` to manually submit list for state management
     */
    it('allLogs$ should return the loaded list; and loaded flag == true', async done => {
      try {
        let list = await readFirst(facade.allLogs$);
        let isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(0);
        expect(isLoaded).toBe(false);

        store.dispatch(new LogsLoaded([createLogs('AAA'), createLogs('BBB')]));

        list = await readFirst(facade.allLogs$);
        isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(2);
        expect(isLoaded).toBe(true);

        done();
      } catch (err) {
        done.fail(err);
      }
    });
  });
});
