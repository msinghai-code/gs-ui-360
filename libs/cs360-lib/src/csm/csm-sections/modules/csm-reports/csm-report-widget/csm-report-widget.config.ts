import { PageContext } from "@gs/cs360-lib/src/common";

export const csmReportWidgetConfig = {
    [PageContext.C360]: {
        getCompanyFilter: true,
        mdaEntityId: 'cId',
        sfdcEntityId: 'aid',
        context: {
        loadWidgetData: true,
        requestSource: "C360",
        globalFilterAlias: 'reports.widget.global_filter_alias.company_filter',
        exportsPayloadKey: "c360ReportDataRequestDTO"
      }
    },
    [PageContext.R360]: {
        getCompanyFilter: false,
        mdaEntityId: 'rId',
        sfdcEntityId: 'rid',
        context: {
          loadWidgetData: true,
          requestSource: "R360",
          globalFilterAlias: 'reports.widget.global_filter_alias.relationship_filter',
          exportsPayloadKey: "c360ReportDataRequestDTO"
        }
    },
    [PageContext.P360]: {
        getCompanyFilter: true,
        mdaEntityId: 'cId',
        sfdcEntityId: 'aid',
        context: {
          loadWidgetData: true,
          requestSource: "P360",
          globalFilterAlias: 'reports.widget.global_filter_alias.person_filter',
          exportsPayloadKey: "c360ReportDataRequestDTO"
        }
    },
    [PageContext.SPACES]: {
        getCompanyFilter: true,
        mdaEntityId: 'cId',
        sfdcEntityId: 'aid',
        context: {
          loadWidgetData: true,
          requestSource: "C360",
          globalFilterAlias: 'reports.widget.global_filter_alias.company_filter',
          exportsPayloadKey: "c360ReportDataRequestDTO"
        }
    }
}
