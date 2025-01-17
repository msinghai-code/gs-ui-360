import { SummaryWidget } from './../../pojo/widget-category';
import { Observable } from 'rxjs';

export interface ISection {
    sectionId?: string;
    id: number | string;
    label: string;
    selectedCompanyId?:string;
    sectionType: string;
    loadEagerly: boolean;
    link: string;
    isDetachSectionPreview?: boolean;
    isLoaded?: boolean;
    timeout?: number;
    layoutId?: string;
    config?: any;
    configured?: boolean;
    scope?: string;
    sections?: SummaryWidget[];
    description?: string;
    state?: any;
    tenantId?: string;
    pinned?: boolean;
    tempPinned?: boolean;
    relationshipTypeId?: string;
    layoutName?: string;
    sectionMeta?: any | Observable<any>;
}
