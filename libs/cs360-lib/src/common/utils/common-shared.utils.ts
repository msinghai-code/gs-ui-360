import {Cs360ContextUtils} from "../cs360.context";
import {PageContext} from "../cs360.constants";

/**
 * Checks if the provided context represents a Customer360 (C360) page.
 *
 * @param ctx The context object to be checked.
 * @returns A boolean value indicating whether the provided context represents a C360 page.
 */
export function isC360(ctx: any): boolean {
    return ctx.pageContext === PageContext.C360;
}

/**
 * Retrieves the Mini360 context from the provided context object.
 *
 * @param ctx The context object from which to extract Mini360 context.
 * @returns An object containing Mini360 context with properties 'appVariant', 'entityName', and 'entityId',
 *          or an empty object if Mini360 context is not found or the provided context is invalid.
 */
export function getReporting360Ctx(ctx: any): { appVariant: string, entityName: string, entityId: string } | {} {
    // If context is not provided or it's not a Mini360 context, return an empty object
    if (!ctx) {
        return {};
    }

    const reporting360Context: { appVariant: string, entityName: string, entityId: string } = {
        appVariant: ctx.appVariant,
        entityName: '',
        entityId: ''
    };

    if (Cs360ContextUtils.isR360(ctx)) {
        reporting360Context.entityName = ctx.relationshipName;
        reporting360Context.entityId = ctx.rId;
    }
    else if (isC360(ctx)) {
        reporting360Context.entityName = ctx.companyName;
        reporting360Context.entityId = ctx.cId || ctx.entityId;
    }

    return reporting360Context;
}