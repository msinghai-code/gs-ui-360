import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFirst } from '@nrwl/angular/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';

import { NxModule } from '@nrwl/angular';

import { CompaniesEffects } from './companies.effects';
import { CompaniesFacade } from './companies.facade';

import { companiesQuery } from './companies.selectors';
import { LoadCompanies, CompaniesLoaded } from './companies.actions';
import {
  CompaniesState,
  Entity,
  initialState,
  reducer
} from './companies.reducer';

interface TestSchema {
  companies: CompaniesState;
}

describe('CompaniesFacade', () => {
  let facade: CompaniesFacade;
  let store: Store<TestSchema>;
  let createCompanies;

  beforeEach(() => {
    createCompanies = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature('companies', reducer, { initialState }),
          EffectsModule.forFeature([CompaniesEffects])
        ],
        providers: [CompaniesFacade]
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
      facade = TestBed.get(CompaniesFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    // it('loadAll() should return empty list with loaded == true', async done => {
    //   try {
    //     let list = await readFirst(facade.companiesLoaded$);
    //     let isLoaded = await readFirst(facade.loaded$);

    //     expect(list.length).toBe(0);
    //     expect(isLoaded).toBe(false);

    //     facade.loadAll();

    //     list = await readFirst(facade.companiesLoaded$);
    //     isLoaded = await readFirst(facade.loaded$);

    //     expect(list.length).toBe(0);
    //     expect(isLoaded).toBe(true);

    //     done();
    //   } catch (err) {
    //     done.fail(err);
    //   }
    // });

    /**
     * Use `CompaniesLoaded` to manually submit list for state management
     */
  //   it('allCompanies$ should return the loaded list; and loaded flag == true', async done => {
  //     try {
  //       let list = await readFirst(facade.companiesLoaded$);
  //       let isLoaded = await readFirst(facade.loaded$);

  //       expect(list.length).toBe(0);
  //       expect(isLoaded).toBe(false);

  //       store.dispatch(
  //         new CompaniesLoaded([createCompanies('AAA'), createCompanies('BBB')])
  //       );

  //       list = await readFirst(facade.companiesLoaded$);
  //       isLoaded = await readFirst(facade.loaded$);

  //       expect(list.length).toBe(2);
  //       expect(isLoaded).toBe(true);

  //       done();
  //     } catch (err) {
  //       done.fail(err);
  //     }
  //   });
  });
});
