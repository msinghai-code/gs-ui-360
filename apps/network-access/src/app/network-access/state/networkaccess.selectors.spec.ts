import { Entity, NetworkaccessState } from './networkaccess.reducer';
import { networkaccessQuery } from './networkaccess.selectors';

describe('Networkaccess Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getNetworkaccessId = it => it['id'];

  let storeState;

  beforeEach(() => {
    const createNetworkaccess = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
    storeState = {
      networkaccess: {
        list: [
          createNetworkaccess('PRODUCT-AAA'),
          createNetworkaccess('PRODUCT-BBB'),
          createNetworkaccess('PRODUCT-CCC')
        ],
        selectedId: 'PRODUCT-BBB',
        error: ERROR_MSG,
        loaded: true
      }
    };
  });

  describe('Networkaccess Selectors', () => {
    it("getLoaded() should return the current 'loaded' status", () => {
      const result = networkaccessQuery.getLoaded(storeState);

      expect(result).toBe(true);
    });

    it("getError() should return the current 'error' storeState", () => {
      const result = networkaccessQuery.getError(storeState);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
