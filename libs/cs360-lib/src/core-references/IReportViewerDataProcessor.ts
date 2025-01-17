/**
 * Created by rpal on 2019-05-23
 */
// import { IReportFilter } from '../../../utils/pojos/IReportFilter';

import { IReportState } from "@gs/report/pojos";

// export interface ISourceDetails {
//   objectName?: string;
//   objectLabel?: string;
//   dataStoreType?: string;
//   connectionId?: string;
//   connectionType?: string;
// }

// export interface IReportState {
//   select: any[];
//   group: any[];
//   order: any[];
//   drilldown?: any[];
//   where: IReportFilter;
//   having: IReportFilter;
//   limit: number;
//   offset: number;
//   id: string;
//   description: string;
//   pageSize: number;
//   reportType: string;
//   reportTypes: string[];
//   displayType: string;
//   reportOptions: any;
//   properties: any;
//   name: string;
//   sourceDetails: ISourceDetails;
//   deleted?: boolean;
// };

export const initialReportState: IReportState = {
  select: [],
  group: [],
  order: [],
  where: {},
  having: {},
  limit: 5,
  offset: 0,
  id: null,
  description: null,
  pageSize: 10,
  reportType: null,
  reportTypes: ['adhoc'],
  displayType: null,
  reportOptions: {},
  properties: {},
  name: "",
  sourceDetails: {},
  deleted: false
};

// export function getReportInitialState(): IReportState {
//   return initialReportState;
// };
