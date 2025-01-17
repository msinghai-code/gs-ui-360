import { GSField } from "@gs/gdk/core";

export const DYNAMIC_PARAMS_REGEX = /\${.*}/;

export interface ParamInfo {
  name: string;
  id: string;
  selectedField?: GSField;
  selectedValue?: any;
}
export interface QueryParam {
  type: string;
  id: string;
  name?: string;
  params?: ParamInfo[];
}

export enum ParamTypes {
  Bundled = "bundled",
  Single = "single"
}

export interface EmbedPageConfig {
  url: string;
  height: number;
  heightFormat: string;
  queryParams: QueryParam[];
  includeSessionValidator: boolean;
}
//{360.admin.embedpage.invalid_params}=Assigned params are not configured.
export enum EMBED_PAGE_MESSAGES {
  INVALID_PARAMS = "360.admin.embedpage.invalid_params"
}

export const HEIGHTS = {
  DEFAULT_PX_HEIGHT: 400,
  DEFAULT_PER_HEIGHT: 100,
  MIN_HEIGHT: (format) => format === "%" ? 10 : 100,
  MAX_HEIGHT: (format) => format === "%" ? 100 : 1000
}

export const EmbedPageFieldSaveProperties = ["fieldName", "label", "dataType", "objectLabel", "objectName"];

export const EmbedPageGlobalFields = ["userConfig.gsUserName", "userConfig.gsUserId", "userConfig.gsUserEmail"];