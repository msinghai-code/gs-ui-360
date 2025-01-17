import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFirst } from '@nrwl/angular/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';

import { NxModule } from '@nrwl/angular';

import { NetworkaccessEffects } from './networkaccess.effects';
import { NetworkaccessFacade } from './networkaccess.facade';

import { networkaccessQuery } from './networkaccess.selectors';
import {
  LoadNetworkaccess,
  NetworkaccessLoaded
} from './networkaccess.actions';
import {
  NetworkaccessState,
  Entity,
  initialState,
  networkaccessReducer
} from './networkaccess.reducer';

interface TestSchema {
  networkaccess: NetworkaccessState;
}

describe('NetworkaccessFacade', () => {
  let facade: NetworkaccessFacade;
  let store: Store<TestSchema>;
  let createNetworkaccess;

  beforeEach(() => {
    createNetworkaccess = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature('networkaccess', networkaccessReducer, {
            initialState
          }),
          EffectsModule.forFeature([NetworkaccessEffects])
        ],
        providers: [NetworkaccessFacade]
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
      facade = TestBed.get(NetworkaccessFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async done => {
      try {
        let list = await readFirst(facade.allNetworkaccess$);
        let isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(0);
        expect(isLoaded).toBe(false);

        facade.loadAll();

        list = await readFirst(facade.allNetworkaccess$);
        isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(0);
        expect(isLoaded).toBe(true);

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    /**
     * Use `NetworkaccessLoaded` to manually submit list for state management
     */
    it('allNetworkaccess$ should return the loaded list; and loaded flag == true', async done => {
      try {
        let list = await readFirst(facade.allNetworkaccess$);
        let isLoaded = await readFirst(facade.loaded$);

        expect(list.length).toBe(0);
        expect(isLoaded).toBe(false);

        store.dispatch(
          new NetworkaccessLoaded([
            createNetworkaccess('AAA'),
            createNetworkaccess('BBB')
          ])
        );

        list = await readFirst(facade.allNetworkaccess$);
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
