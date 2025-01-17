export interface Log extends base {
  jobId: string,
  logId: string,
  tenantId: string,
  actionType: string,
  moduleName: string,
  logStatus: string,
  details: string,
  uiMessage: string,
  createdDateStr: string,
  modifiedDateStr: string
}


export interface LogInfo {
  status: boolean,
  logs: Log[]
}

export interface MergeConfig extends base {
  tenantId: string,
  mergeId: string,
  jobStatus: string,
  mergeCompanies: string[],
  moduleStatus: any,
  recordsUpdatedCountByModule: any,
  jobStartDateTime: any,
  jobEndDateTime: any,
  failedModules: number;
  mergeDetails?: Object;
  isLoaded: boolean, // custom for UI purpose
  logs: any,
  isSelected: boolean;
  mergeName: string;
}

export interface base {
  createdDate: string,
  modifiedDate: string,
  createdBy: string,
  createdByName: string,
  modifiedBy: string,
  modifiedByName: string,
  deleted: boolean
}
