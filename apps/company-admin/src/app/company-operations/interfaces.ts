import { DataTypes } from "./constants";

export interface CompaniesFilterInfo {
    filterConditions?: any;
    filterInfo: FilterInfo;
}

export interface FilterInfo {
    config: FilterConfig;
    host: any;
    objectName: string;
    filterInfo: any;
}

export interface FilterConfig {
    locale: string;
    currency: string;
    search: any;
    user: any;
}

export interface LoadCompaniesPayload {
    select: string[];
    where: any;
    orderBy: any;
    limit: number;
    offset: number;
    objectName: any;
    host?: any;
}

export interface CompanyGridPageInfo {
    totalRecords: number;
    totalPages: number;
    limit: number;
    pageNumber: number;
    nextAvailable: boolean;
    pageSize: number;
}

export interface CompanyFieldInfo {
    fieldName: string;
    dbName: string;
    label: string;
    dataType: DataTypes;
    objectName: string;
    objectDBName: string;
    objectLabel: string;
    meta: any;
}

export interface ContextMenuInfo {
    contextMenuItems: ContextMenuItem[];
    selectedCompany?: any;
}

export interface ContextMenuItem {
    id: string; 
    icon: string; 
    label: string;
}

export interface CompanyUpsertResolverResponse {
    objectDefinition: CompanyUpsertObjectDefinition;
    objectName: string;
    recordId: string;
    editable: boolean;
    data: any[];
    editsAllowed: any[];
    error?: any;
    message?: any;
    schema?: any;
}

export interface CompanyUpsertObjectDefinition {
    objectName: string;
    sections: {
        objectName: string;
        source : string;
        label: string;
        columns: {
            attributes: any[]
        }[]
    };
}

