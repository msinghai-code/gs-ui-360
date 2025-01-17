import { Company } from "./Company";

export interface CompanyStore {
    loading: boolean;
    companies: Company[];
}

export interface CompanyState {
    companiesState: CompanyStore;
}