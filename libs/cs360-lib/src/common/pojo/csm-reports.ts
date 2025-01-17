export interface CsmReports {
}

export interface MappingResponse {
    createdDate?: null;
    modifiedDate?: null;
    createdBy?: null;
    createdByName?: null;
    modifiedBy?: null;
    modifiedByName?: null;
    deleted: boolean;
    entityId?: null;
    companyMapping: any;
    tenantId: string;
    connectionId?: null;
    createdDateStr?: null;
    modifiedDateStr?: null;
}

export interface IGroupState {
    selectedReportId?: string;
    showDataFromChildren?: boolean;
    wraplines?: boolean;
}
