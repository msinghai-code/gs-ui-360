import { Component, EventEmitter, OnInit, Output, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { filter, each } from 'lodash';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import {CONTEXT_INFO, ICONTEXT_INFO, ISection, notAvailableSectionTypesInMini360} from "@gs/cs360-lib/src/common";

@Component({
  selector: 'gs-manage-sections',
  templateUrl: './manage-sections.component.html',
  styleUrls: ['./manage-sections.component.scss']
})
export class ManageSectionsComponent implements OnInit, OnChanges {
  @Input() sections: Array<ISection>;
  @Input() isLoading: boolean;
  @Input() sectionId : string;
  applicableSections: Array<ISection> = [];
  searchInput = new FormControl();
  searchTerm: string;
  pinnedSections: Array<any> = [];
  unPinnedSections: Array<any> = [];
  isSectionLable:boolean = false;
  isMini360 : boolean = false;
  sectionsLimit: number;
  constructor(private i18nService: NzI18nService, @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }
  // {360.csm.manage_section.title}=Drag to reorder sections. A maximum of 10 sections can be pinned.
  title: string = this.i18nService.translate('360.csm.manage_section.title');
  // {360.csm.manage_section.tooltipTitle}=You have pinned the maximum number of sections.
  tooltipTitle: string = this.i18nService.translate('360.csm.manage_section.tooltipTitle');

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.applicableSections = this.isMini360 ? this.sections.filter(item => !notAvailableSectionTypesInMini360.includes(item.sectionType)) : this.sections;
    this.sectionsLimit = this.isMini360 ? 5 : 10;
    this.title = this.isMini360 ? 'Sections can be reordered by dragging. A maximum of 5 sections can be pinned.' : this.i18nService.translate('360.csm.manage_section.title');
    each(this.applicableSections, section => {
      if (section.pinned) {
        this.pinnedSections.push({ ...section });
      } else {
        this.unPinnedSections.push({ ...section });
      }
    });
    this.subscribeForSearchInput();
  }

  drop(event: CdkDragDrop<string[]>, isPinned: boolean) {
    if (isPinned) {
      moveItemInArray(this.pinnedSections, event.previousIndex, event.currentIndex);
    } else {
      moveItemInArray(this.unPinnedSections, event.previousIndex, event.currentIndex);
    }
  }

  togglePin(section) {
    if (section.pinned) {
      section.pinned = false;
      this.pinnedSections = this.pinnedSections.filter(pinnedSection => pinnedSection.sectionId !== section.sectionId);
      this.unPinnedSections = [...this.unPinnedSections, section];
    } else {
      section.pinned = true;
      this.unPinnedSections = this.unPinnedSections.filter(unpinnedSection => unpinnedSection.sectionId !== section.sectionId);
      this.pinnedSections = [...this.pinnedSections, section];
    }

    this.isSectionLable = this.pinnedSections.length == 0;
  }

  subscribeForSearchInput() {
    this.searchInput.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((text: any) => {
      this.searchTerm = text;
    });
  }
}
