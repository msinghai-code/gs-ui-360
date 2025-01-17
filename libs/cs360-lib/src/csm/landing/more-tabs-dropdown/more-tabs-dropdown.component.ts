import { Component, OnInit, EventEmitter, Output, Input, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CONTEXT_INFO, ICONTEXT_INFO, PX_CONSTANTS, CS360CacheService } from "@gs/cs360-lib/src/common";
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { notAvailableSectionTypesInMini360 } from '@gs/cs360-lib/src/common/cs360.constants';

@Component({
  selector: 'gs-more-tabs-dropdown',
  templateUrl: './more-tabs-dropdown.component.html',
  styleUrls: ['./more-tabs-dropdown.component.scss']
})
export class MoreTabsDropdownComponent implements OnInit {
  @Output() updates = new EventEmitter<any>();
  @Input() sections : Array<any>;
  @Input() isMini360? = false;
  searchInput = new FormControl();
  searchTerm: string;
  public pinnedSections = [];
  public unPinnedSections = [];
  public notAvailableInMini360 = [];
  public pxClasses;
  constructor(private router:Router, @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO, public c360CacheService: CS360CacheService,
  ) {
      this.pxClasses =  PX_CONSTANTS.TABS_DROPDOWN(this.ctx.pageContext);
  }

  ngOnInit() {
    this.subscribeForSearchInput();
    // this.isMini360 = isMini360(this.ctx);
    this.unPinnedSections = this.sections.filter(item =>
        (this.isMini360 ? (!item.pinned && !notAvailableSectionTypesInMini360.includes(item.sectionType)) : !item.pinned)
    );

    this.notAvailableInMini360 = this.isMini360
        ? this.sections.filter(item => notAvailableSectionTypesInMini360.includes(item.sectionType))
        : [];
  }

  manageSections() {
    this.updates.emit({
      type : "MANAGE_CLICKED"
    })
  }

  subscribeForSearchInput() {
    this.searchInput.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((text: any) => {
      this.searchTerm = text;
    });
  }

  navigateToSection(item, sections) {
    if(this.isMini360 && notAvailableSectionTypesInMini360.includes(item.sectionType)) {
      // nested if else to handle different page context like P360, C360, R360
      this.redirectMiniTo360(
          this.ctx.pageContext,
          this.ctx.pageContext==='C360' ? this.ctx.cId : this.ctx.pageContext==='R360'? this.ctx.rId : this.ctx.cId,
          item.sectionId);
      return;
    }
    sections.forEach(s => {
      s.tempPinned = false;
    });

    let toNavIndex = 0
    if(!item.pinned) {
      item.tempPinned = true;
      toNavIndex = this.sections.findIndex(sec => sec.sectionId === item.sectionId);
    }  else {
      toNavIndex = sections.indexOf(item);
    }
    if(this.isMini360) {
    this.c360CacheService.navigateToTab(item.sectionType, null, null, item.sectionId);
    } else {
      this.router.navigate(['/' + item.sectionId]);
    }
    setTimeout(() => {
      this.updates.emit({
        type : "SECTION_CLICKED",
        payload : {
          navigateIndex : toNavIndex
        }
      });
    }, 200);
  }

  redirectMiniTo360(pageContext, id, sectionId) {
    let url = '';

    if (pageContext === 'C360') {
      url = `customersuccess360?cid=${id}#/${sectionId}`;
    } else if (pageContext === 'R360') {
      url = `Relationship360?rid=${id}#/${sectionId}`;
    } else if (pageContext === 'P360') {
      // Uncomment and modify the link if needed in the future for P360 or other contexts
      // url = `person360?cid=${id}#/${sectionId}`;
    }

    if (url) {
      const fullUrl = HybridHelper.generateNavLink(url);
      window.open(fullUrl, '_blank');
        this.updates.emit({
          type : "MINI_REDIRECTION_CLICKED",
          payload : null
        });
    }
  }

}
