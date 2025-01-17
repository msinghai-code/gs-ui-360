import { logsQuery } from './logs.selectors';

describe('Logs Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getLogsId = it => it['id'];

  let storeState;

  beforeEach(() => {
    const createLogs = (id: string, name = ''): any => ({
      id,
      name: name || `name-${id}`
    });
    storeState = {
      logs: {
        list: [
          createLogs('PRODUCT-AAA'),
          createLogs('PRODUCT-BBB'),
          createLogs('PRODUCT-CCC')
        ],
        selectedId: 'PRODUCT-BBB',
        error: ERROR_MSG,
        loaded: true
      }
    };
  });

  describe('Logs Selectors', () => {
    it('getAllLogs() should return the list of Logs', () => {
      const results = logsQuery.getMergeConfigs(storeState);
      const selId = getLogsId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it("getLoaded() should return the current 'loaded' status", () => {
      const result = logsQuery.getLoaded(storeState);

      expect(result).toBe(true);
    });

  });
});
