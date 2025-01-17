import {ObjectNames, PageContext, ObjectLabels, ObjectLabelsForSection, TranslatedObjectNames, ContextToEntityNameMapping} from "./cs360.constants";
// import {AppInjector} from "@gs/core";
// import {NzI18nService} from "@gs/ng-horizon/i18n";
import { TranslocoService } from '@ngneat/transloco';

export class Cs360ContextUtils {

    static getAreaName(ctx? :any) {
        return ctx.pageContext && ctx.pageContext.toLowerCase();
    }

    static getSourceDetails(translocoService: TranslocoService, ctx? :any) {
        // const  i18nService = AppInjector.get(NzI18nService);
        if(ctx && ctx.pageContext === PageContext.R360) {
            return Cs360ContextUtils.getSourceDetailsForRelationship(translocoService);
        }
        return {
            "objectName": ObjectNames.COMPANY,
            "objectLabel": translocoService.translate(ObjectLabels.COMPANY),
            "connectionType": "MDA",
            "connectionId": "MDA",
            "dataStoreType": "HAPOSTGRES"
        }
    }

    static getBaseObjectName(ctx?: any) {
        return ctx && ctx.pageContext === PageContext.R360 ? ObjectNames.RELATIONSHIP : ObjectNames.COMPANY ;
    }

    static getTranslatedBaseObjectName(ctx?: any) {
        return ctx && ctx.pageContext === PageContext.R360 ? TranslatedObjectNames.RELATIONSHIP : TranslatedObjectNames.COMPANY ;
    }

    // This will give the translation key given the entity name. Use this generic to eliminate checks on C360 or R360
    static getTranslatedBaseObjectNameV2(name?: any) {
        return TranslatedObjectNames[name];
    }

    static getBaseObjectLabel(ctx?: any) {
        return ctx && ctx.pageContext === PageContext.R360 ? ObjectLabelsForSection.RELATIONSHIP : ObjectLabelsForSection.COMPANY;
    }

    static getTranslatedBaseObjectLabel(translocoService: TranslocoService, ctx?: any) {
        // const  i18nService = AppInjector.get(NzI18nService);
        return ctx && ctx.pageContext === PageContext.R360 ? translocoService.translate(ObjectLabels.RELATIONSHIP) : translocoService.translate(ObjectLabels.COMPANY);
    }

    // This will give the entity name given the context. Use this generic to eliminate checks on C360 or R360
    static getContextToEntityNameMapping(ctx?: any) {
        return ContextToEntityNameMapping[ctx];
    }

    static getUniqueCtxId(ctx?: any) {
        return ctx && ctx.pageContext === PageContext.R360 ? ctx.rId : ctx.cId;
    }

    static getRelationshipBaseObjectName() {
        // TODO
        return ObjectNames.RELATIONSHIP;
    }

    static isR360(ctx: any) {
        return ctx.pageContext === PageContext.R360;
    }

    static getSourceDetailsForRelationship(translocoService: TranslocoService) {
        // TODO: will change later
        // const  i18nService = AppInjector.get(NzI18nService);
        return {
            "objectName": ObjectNames.RELATIONSHIP,
            "objectLabel": translocoService.translate(ObjectLabels.RELATIONSHIP),
            "connectionType": "MDA",
            "connectionId": "MDA",
            "dataStoreType": "HAPOSTGRES"
        }
    }

    static getPreviewDataPayload(searchedTerm?: string, gsid?: string, relationshipTypeId?:string, operator?:string) {
        // objectName need to be changed based on context
    
        const query: any = {
            limit: 10,
            objectName: "company",
            offset: 0,
            select: ["Name", "Gsid"],
        };
        const conditions = [];

        if (searchedTerm) {
            conditions.push({ alias: "A", name: "Name", operator: "CONTAINS", value: [searchedTerm || ""] })
        } else {
            conditions.push({ alias: "A", name: "Name", operator: "IS_NOT_NULL" })
        }

        if(gsid) {
            conditions.push({ alias: "B", name: "Gsid", operator: "EQ", value: [gsid] })
        }

        if(relationshipTypeId){
            conditions.push({ alias: "C", name: "typeId", operator: "EQ", value: [relationshipTypeId] })
        }

        if(conditions.length) {
            query.where = {
                expression: conditions.map(cond => cond.alias).join(operator ? ' ' + operator.trim() + ' ' : ' OR '),
                conditions
            }
        }

        return query;
    }

    static getContextualLabel(value: string, ctx) {
        const contextualLabel = value.replace(/^360/, `360.lib.${ctx.pageContext.toLowerCase()}`);
        return contextualLabel;
    }
}
