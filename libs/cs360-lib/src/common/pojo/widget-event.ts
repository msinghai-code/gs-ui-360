import { WidgetCategory, WidgetItemSubType } from "./widget-category";

export interface WidgetEvent {
  eventType: EventType;
  contextCategory : WidgetCategory;
  message: any;
  data: any;
  entityId?: string;
  dataEditEntityId?: string;
  entityType?: string;
}

export enum EventType {
  UPDATE,
  REMOVE,
  REFRESH,
  ERROR,
  SAVE,
  RESIZE
}

export const Redirections = {
  [WidgetItemSubType.COCKPIT]: 'COCKPIT',
  [WidgetItemSubType.COCKPIT_CTA]: 'COCKPIT',
  [WidgetItemSubType.ASP]: 'SUCCESS_PLAN',
  [WidgetItemSubType.SP]: 'SUCCESS_PLAN',
  [WidgetItemSubType.LEADS]: 'LEADS'
}
