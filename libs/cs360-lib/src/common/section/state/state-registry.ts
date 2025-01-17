/**
 * created by rpal on jun 9, 2021.
 */

export namespace StateProviderRegistry {

    const sectionStateEnablementRegisterBySectionType = {
        RELATED_LIST: true,
        RELATIONSHIP: true,
        SUMMARY: true
    }

    export function getSectionStateEnablementStatus(sectionType: string): boolean {
        return sectionStateEnablementRegisterBySectionType[sectionType] ||  false;
    }

}
