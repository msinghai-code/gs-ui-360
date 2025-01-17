import { LogsLoaded } from './logs.actions';
import { LogsState, Entity, initialState, logsReducer } from './logs.reducer';

describe('Logs Reducer', () => {
  const getLogsId = it => it['id'];
  let createLogs;

  beforeEach(() => {
    createLogs = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
  });

  describe('valid Logs actions ', () => {
    it('should return set the list of known Logs', () => {
      const logss = [createLogs('PRODUCT-AAA'), createLogs('PRODUCT-zzz')];
      const action = new LogsLoaded(logss);
      const result: LogsState = logsReducer(initialState, action);
      const selId: string = getLogsId(result.list[1]);

      expect(result.loaded).toBe(true);
      expect(result.list.length).toBe(2);
      expect(selId).toBe('PRODUCT-zzz');
    });
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = logsReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
