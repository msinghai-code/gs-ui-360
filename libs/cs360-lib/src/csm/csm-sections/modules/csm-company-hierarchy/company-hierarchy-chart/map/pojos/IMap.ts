import { CHART_ATTRIBUTES as ca } from '../map.constant';

export interface IMapOptions{
  uniqueIdentifier: string;
  GAEventLabel?: string;
  GAEventCategory?: string;
  lazyLoading?: boolean;
  primaryNode?: string;
  enableDragDrop?: boolean;
  scaleInitial?: number;
  template?: string;
  levelSeparation?: number;
  mixedHierarchyNodesSeparation?: number;
  layout?: "normal" | "mixed" | "tree";
  scaleMin?: number;
  scaleMax?: number;
  enableSearch?: boolean
};

export interface IMapData{
  id:string;
  pid:string;
  name:string;
}
