export enum SidenavActions {
  CLOSE = 'CLOSE',
  SAVE = 'SAVE'
}

export enum MappingObjects {
  GS_COMPANY_ID = "company",
  GS_COMPANY_NAME = "company",
  GS_USER_ID = "gsuser",
  GS_USER_NAME = "gsuser",
  GS_USER_EMAIL = "gsuser",
  GS_RELATIONSHIP_ID = "relationship",
  GS_RELATIONSHIP_NAME = "relationship",
  GS_RELATIONSHIP_TYPE_ID = "relationship_type",
  GS_RELATIONSHIP_TYPE_NAME = "relationship_type"
}

export enum DataTypes {
  SFDCID = "SFDCID",
  PICKLIST = "PICKLIST",
  EMAIL = "EMAIL",
  LOOKUP = "LOOKUP",
  PERCENTAGE = "PERCENTAGE",
  CURRENCY = "CURRENCY",
  GSID = "GSID",
  RICHTEXTAREA = "RICHTEXTAREA",
  MULTISELECTDROPDOWNLIST = "MULTISELECTDROPDOWNLIST",
  JSON = "JSON",
  JSONSTRING = "JSONSTRING",
  JSONNUMBER = "JSONNUMBER",
  JSONBOOLEAN = "JSONBOOLEAN",
  WHOID = "WHOID",
  WHATID = "WHATID",
  CONTEXT = "CONTEXT",
  URL = "URL",
  DATE = "DATE",
  DATETIME = "DATETIME",
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN"
}

export enum PortfolioScopes {
  DASHBOARD = "Dashboard",
  GSHOME = "GSHome" 
}

export enum PortfolioRoleTypes {
  ADMIN = "Admin",
  User = "User" 
}

export enum GridRequestSource {
  BULKEDIT = "BULKEDIT",
  ADMINCONFIG = "ADMINCONFIG",
  USERCONFIG = "USERCONFIG",
  INLINEEDIT = "INLINEEDIT",
  PREVIEW = "PREVIEW"
}

export enum HealthScoreFields {
   COMPANY_HEALTHSCORE ='company_CurrentScore',
   RELATIONSHIP_HEALTHSCORE ='relationship_CurrentScore'
}
