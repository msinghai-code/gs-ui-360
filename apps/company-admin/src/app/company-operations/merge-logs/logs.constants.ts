export const LOG_API_CONSTANTS = {
  GET_MERGE_CONFIGS : (mergeId? : string)=> mergeId? `v1/data/merge/${mergeId}` : `v1/data/merge`,
  GET_LOGS_BY_MERGE_ID : (mergeId : string) => `v1/data/logs/${mergeId}`,
  RETRIGGER_MERGE : (mergeId : string) => `v1/data/merge/retrigger/${mergeId}`
};

export const LOG_CONSTANTS = {
  LOAD_MERGE_CONFIGS_ERROR_MESSAGE :'Unable to fetch merge configs. Refresh the page to try again.',
  LOAD_LOGS_BY_MERGE_ID_ERROR_MESSAGE: 'Unable to fetch merge log details. Refresh the page to try again.',
  POLLING_INTERVAL : 5000,
};

export enum RUN_TYPE {
  MANUAL = 'Manual'
}

export enum MERGE_JOB_STATUS {
  SUCCESS = 'SUCCESS',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  RECEIVED = 'RECEIVED'
}
