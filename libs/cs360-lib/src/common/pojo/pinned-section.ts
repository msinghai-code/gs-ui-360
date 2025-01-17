export interface PinnedSection {
  layoutId?: string;
  sectionInfo: SectionInfo[];
  configId?: string;
}

export interface SectionInfo {
  sectionId: string;
  order: number;
  pinned: boolean;
}
