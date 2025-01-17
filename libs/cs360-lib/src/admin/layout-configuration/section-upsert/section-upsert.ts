// import { Section } from "@gs/cs360-lib";
import { Section } from "../../admin-sections/modules/shared/section-listing/section-listing.interface";

export interface LayoutSection extends Section {
  sectionType: string;
  allowedInGlobalSection: boolean;
  configured?: boolean;
  configurable?: boolean;
  showWarning?: boolean;
  relationshipTypeId?: string;
  description?: string;
  showLabelInput?: boolean;
  scope?: any;
}
//{360.admin.SectionSteps.details}=details
//{360.admin.SectionSteps.configure}=configure
export enum SectionSteps {
  DETAILS = 'details',
  CONFIGURE = 'configure'
}
//{360.admin.SectionStepsLabels.basic_details}=Basic Details
//{360.admin.SectionStepsLabels.configure_section}=Configure Section
export enum SectionStepsLabels {
  DETAILS = "360.admin.SectionStepsLabels.basic_details",
  CONFIGURE = "360.admin.SectionStepsLabels.configure_section"
}

export enum SectionStepsToIndexMap {
  DETAILS = 0,
  CONFIGURE = 1
}
