import { Entity, CompaniesState } from './companies.reducer';
import { companiesQuery } from './companies.selectors';

describe('Companies Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getCompaniesId = it => it['id'];

  let storeState;

  beforeEach(() => {
    const createCompanies = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
    storeState = {
      companies: {
        list: [
          createCompanies('PRODUCT-AAA'),
          createCompanies('PRODUCT-BBB'),
          createCompanies('PRODUCT-CCC')
        ],
        selectedId: 'PRODUCT-BBB',
        error: ERROR_MSG,
        loaded: true
      }
    };
  });

  describe('Companies Selectors', () => {
    it('getAllCompanies() should return the list of Companies', () => {
      const results = companiesQuery.getAllCompanies(storeState);
      const selId = getCompaniesId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSelectedCompanies() should return the selected Entity', () => {
      const result = companiesQuery.getSelectedCompanies(storeState);
      const selId = getCompaniesId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it("getLoaded() should return the current 'loaded' status", () => {
      const result = companiesQuery.getLoaded(storeState);

      expect(result).toBe(true);
    });

    it("getError() should return the current 'error' storeState", () => {
      const result = companiesQuery.getError(storeState);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
