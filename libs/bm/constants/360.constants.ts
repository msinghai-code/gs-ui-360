export const API_VERSION_NUMBER = `v2`;
export const GALAXY_ROUTE = `${API_VERSION_NUMBER}/galaxy`;

export enum ObjectNames {
    RELATIONSHIP = "relationship",
    COMPANY = "company",
    USER = "gsuser"
}

export const API_ENDPOINTS = {
    GET_OBJECTS: `v1/api/describe/listobjects/mda`,
    GET_SFDC_OBJECTS: `v1/api/describe/listobjects/SFDC`,
    GET_OBJECT_RELATIONSHIPTYPES: (objectName) => `${GALAXY_ROUTE}/relationship/association/associatedTypes/${objectName}`,
    GET_RELATIONSHIP_OBJECTS: `v1/api/describe/listobjects/mda?po=relationship`,
    UPSERT_ASSOCIATION: `${GALAXY_ROUTE}/relationship/association`,
    UPSERT_MULTIPLE_ASSOCIATION: `${GALAXY_ROUTE}/relationship/association/all`
};