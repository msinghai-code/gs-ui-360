import { WidgetCategory, SummaryWidget, WidgetCategoryType, DimensionDetails, WidgetItemType, WidgetItemSubType } from './../pojo/widget-category';


export function transformWidgetCategory(category: WidgetCategory) {
  const { label, widgets, widgetCategory, dimensionDetails, active, mini360Dimensions } = category;

  const children = (widgets || []).map((widget: SummaryWidget) => {
    let config = widget.dimensionDetails;
    if (config) {
      config = transformWidgetDimensions(config);
    }
    return { ...widget, dimensionDetails: config };
  });

  return {
    label,
    children,
    widgetCategory,
    dimensionDetails,
    active,
    mini360Dimensions,
    isLoading: false,
    treeOptions: {
      isOutsideDroppable: true,
      isDragIndicatorRequired: true,
      isDataTypeIconRequired: true,
      validateDrop: true,
      filter: false,
      filterBy: "label",
      iconTheme: widgetCategory === WidgetCategoryType.REPORT ? 'report' : '',
      iconType: widgetCategory === WidgetCategoryType.REPORT ? 'REPORTS' : (widgetCategory === WidgetCategoryType.FIELD) ? 'FIELDS' : ''
    }
  } as WidgetCategory;
}

export function transformWidgetDimensions(config: DimensionDetails) {
  if (config) {
    const maxItemCols = config.maxItemCols && config.maxItemCols > 0 ? config.maxItemCols : config.cols;
    const maxItemRows = config.maxItemRows && config.maxItemRows > 0 ? config.maxItemRows : config.rows;
    const minItemCols = config.minItemCols && config.minItemCols > 0 ? config.minItemCols : config.cols;
    const minItemRows = config.minItemRows && config.minItemRows > 0 ? config.minItemRows : config.rows;
    return {
      ...config,
      maxItemCols,
      maxItemRows,
      minItemCols,
      minItemRows,
    };
  }
  return config;
}

export function removeUnusedPropertiesFromWidgetDimensions(config: DimensionDetails) {
  if (config) {
    if (config.cols === config.minItemCols) {
      delete config.minItemCols;
    }
    if (config.cols === config.maxItemCols) {
      delete config.maxItemCols;
    }

    if (config.rows === config.minItemRows) {
      delete config.minItemRows;
    }

    if (config.rows === config.maxItemRows) {
      delete config.maxItemRows;
    }
  }
  return config;
}

export function getWidgetId(counter: number, suffix?: string) {
  return `${suffix}${counter}`;
}

export function getFieldItemId(widgetId:string, objectName:string,fieldName:string) {
  return `${widgetId}__${objectName}__${fieldName}`;
}

export function isMultiObject(ctx){
  return ctx.associatedObjects && ctx.associatedObjects.length;
}

export function isMultiObjectWidget(subType){
  return subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE;
}
