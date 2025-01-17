import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SubSink } from 'subsink';

import {filter} from "rxjs/operators";
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import {SectionStepsLabels, SectionSteps, SectionStepsToIndexMap} from "./section-upsert";
import {SharedRouteOutletService} from "./section-upsert.service";
import {NzI18nService} from "@gs/ng-horizon/i18n";
@Component({
  selector: 'gs-section-upsert',
  templateUrl: './section-upsert.component.html',
  styleUrls: ['./section-upsert.component.scss']
})
export class SectionUpsertComponent implements OnInit {

  current = 0;
  displaySectionUpsert = true;
  header: string;
  sectionId: string;
  className: string;
  isCreateMode: boolean;
  tabs = [
    {
      label: this.i18nService.translate('360.admin.SectionStepsLabels.basic_details'),
      link: SectionSteps.DETAILS
    },
    {
      label: this.i18nService.translate('360.admin.SectionStepsLabels.configure_section'),
      link: SectionSteps.CONFIGURE
    }
  ];
  private subs = new SubSink();

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private sharedRouteOutletService: SharedRouteOutletService,
      private cdr: ChangeDetectorRef,
      private i18nService: NzI18nService) { }
//{'360.admin.section_upsert_Add'}=Add
//{'360.admin.section_upsert_section'}=Section
  ngOnInit() {
    this.subs.add(this.route.data.subscribe(data => {
      const layoutDetails: any = data.details || {};
      let headerLabel = this.route.snapshot.queryParams.type ? this.route.snapshot.queryParams.type: "";
      this.header = this.i18nService.translate('360.admin.section_upsert_Add') + ' '+ this.getHeaderName(headerLabel) + ' ' + this.i18nService.translate('360.admin.section_upsert_section');
      this.sectionId = this.route.snapshot.params.sectionId;
      this.isCreateMode = this.route.snapshot.queryParams.mode === "create";
      this.className = this.isCreateMode ? "section-upsert section-upsert__create" : "section-upsert section-upsert__edit";
      this.setCurrentStepIndex();
      this.subscribeToRouteChange();
    }));
    this.associatedSubs();
  }

  getHeaderName(type: string): string {
    switch (type) {
      case 'ATTRIBUTE':
        return this.i18nService.translate('360.admin.section_upsert_attribute');
      case 'EMBED_PAGE':
        return this.i18nService.translate('360.admin.section_upsert_embedpage');
      case 'SUMMARY':
        return this.i18nService.translate('360.admin.section_upsert_summary');
      case 'RELATED_LIST':
        return this.i18nService.translate('360.admin.section_upsert_report');
      case 'PERSON':
        return this.i18nService.translate('360.admin.section_upsert_person');
        case 'COMPANY_HIERARCHY':
            return this.i18nService.translate('360.admin.section_upsert_company_hierarchy');
      default: return '';
    }
  }

  private associatedSubs() {
    this.subs.add(
      this.sharedRouteOutletService
        .changeEmitted$
        .subscribe((label) => {
          this.header = label;
          this.cdr.detectChanges();
        })
    );
  }

  private subscribeToRouteChange() {
    this.subs.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(params => {
      this.setCurrentStepIndex();
    }));
  }

  private subscribeToStepChange() {

  }

  private setCurrentStepIndex() {
    switch(this.route.firstChild.snapshot.url[0].path) {
      case SectionSteps.DETAILS: this.current = SectionStepsToIndexMap.DETAILS; break;
      case SectionSteps.CONFIGURE: this.current = SectionStepsToIndexMap.CONFIGURE; break;
    }
  }

  navigateBack() {
    this.router.navigate([APPLICATION_ROUTES.COMMON_LAYOUTS]);
  }

  ngOnDestroy() {
    this.displaySectionUpsert = false;
    this.subs.unsubscribe();
  }

  onIndexChange(index: number): void {
    if(!this.sectionId || this.sectionId === 'new') {
      return;
    }
    
    const routes: string[] = Object.values(SectionSteps);
    this.router.navigate([routes[index]], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

}
