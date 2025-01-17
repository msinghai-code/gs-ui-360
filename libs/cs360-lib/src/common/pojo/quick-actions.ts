
export interface QuickActionContext {
  type: string;
  show: boolean;
  data?: any;
  componentRef?:any;
  id?: string;
  cancel?: any;
  save?: any;
  loading?: boolean;
  title?: string;
}

