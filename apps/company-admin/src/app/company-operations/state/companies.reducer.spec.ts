import { CompaniesLoaded } from './companies.actions';
import {
  CompaniesState,
  Entity,
  initialState,
  reducer
} from './companies.reducer';

describe('Companies Reducer', () => {
  const getCompaniesId = it => it['id'];
  let createCompanies;

  beforeEach(() => {
    createCompanies = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
  });

  describe('valid Companies actions ', () => {
    it('should return set the list of known Companies', () => {
      const companiess = [
        createCompanies('PRODUCT-AAA'),
        createCompanies('PRODUCT-zzz')
      ];
      const action = new CompaniesLoaded(companiess);
      const result: CompaniesState = reducer(initialState, action);
      const selId: string = getCompaniesId(result.list[1]);

      expect(result.loaded).toBe(true);
      expect(result.list.length).toBe(2);
      expect(selId).toBe('PRODUCT-zzz');
    });
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
