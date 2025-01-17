import { NetworkaccessLoaded } from './networkaccess.actions';
import {
  NetworkaccessState,
  Entity,
  initialState,
  networkaccessReducer
} from './networkaccess.reducer';

describe('Networkaccess Reducer', () => {
  const getNetworkaccessId = it => it['id'];
  let createNetworkaccess;

  beforeEach(() => {
    createNetworkaccess = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
  });

  describe('valid Networkaccess actions ', () => {
    it('should return set the list of known Networkaccess', () => {
      const networkaccesss = [
        createNetworkaccess('PRODUCT-AAA'),
        createNetworkaccess('PRODUCT-zzz')
      ];
      const action = new NetworkaccessLoaded(networkaccesss);
      const result: NetworkaccessState = networkaccessReducer(
        initialState,
        action
      );
      const selId: string = getNetworkaccessId(result.list[1]);

      expect(result.loaded).toBe(true);
      expect(result.list.length).toBe(2);
      expect(selId).toBe('PRODUCT-zzz');
    });
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = networkaccessReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
