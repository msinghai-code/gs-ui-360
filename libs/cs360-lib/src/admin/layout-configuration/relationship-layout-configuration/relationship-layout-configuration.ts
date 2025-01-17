import { CustomizedField } from '@gs/cs360-lib/src/common';

export enum RelationshipConfigurationSteps {
  DETAILS = "details",
  CONFIGURE = "configure"
}
export enum RelationshipConfigurationStepsLabels {
  ASSIGN = "360.admin.relationship_configuration.assign",
  CONFIGURE = "360.admin.relationship_configuration.configure"
}

export enum RelationshipConfigurationStepsToIndexMap {
  ASSIGN = 0,
  CONFIGURE = 1
}

// export interface IRelationshipConfig {
//   name: string;
//   relationshipTypeIds: string[];
//   list?: any[];
//   card?: any[];
//   ribbon?: any;
//   viewId?: string;
//   default?: boolean;
// }

export interface RelationshipConfigCustomizedField extends CustomizedField {
  properties?: any;
  customizable?: boolean;
  path?: string;
}

export interface IRelationshipSummaryRibbonConfig {
  itemId: string;
  label: string;
  widgetCategory: string;
  attributeId?: string;
  attributeCategory?: string;
  config?: any;
  axisDetails: any;
  dimensionDetails: any;
}
