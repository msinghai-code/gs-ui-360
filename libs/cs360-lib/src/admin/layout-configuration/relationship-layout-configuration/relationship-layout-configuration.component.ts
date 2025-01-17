import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { filter } from "rxjs/operators";
import { RelationshipConfigurationStepsLabels, RelationshipConfigurationSteps, RelationshipConfigurationStepsToIndexMap } from "./relationship-layout-configuration";
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import {SharedLayoutRouteOutletService} from "./relationship-layout-configuration.service";

@Component({
  selector: 'gs-relationship-layout-configuration',
  templateUrl: './relationship-layout-configuration.component.html',
  styleUrls: ['./relationship-layout-configuration.component.scss']
})
export class RelationshipLayoutConfigurationComponent implements OnInit {

  current = 0;
  displayRelationshipConfiguration = true;
  header: string;
  layoutId: string;
  className: string;
  isCreateMode: boolean;
  tabs = [
    {
      label: RelationshipConfigurationStepsLabels.ASSIGN,
      link: RelationshipConfigurationSteps.DETAILS
    },
    {
      label: RelationshipConfigurationStepsLabels.CONFIGURE,
      link: RelationshipConfigurationSteps.CONFIGURE
    }
  ];
  private subs = new SubSink();

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private sharedRouteOutletService: SharedLayoutRouteOutletService,
      private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subs.add(this.route.data.subscribe(routeData => {
      const { data } = routeData;
      const configDetails: any = data.config || {};
      this.header = configDetails.name || "New Relationship Section View";
      this.layoutId = configDetails.configId;
      this.isCreateMode = this.route.snapshot.queryParams.mode === "create";
      this.className = this.isCreateMode ? "layout-upsert layout-upsert__create" : "layout-upsert layout-upsert__edit";
      this.setCurrentStepIndex();
      this.subscribeToRouteChange();
    }));
    this.associatedSubs();
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
      case RelationshipConfigurationSteps.DETAILS: this.current = RelationshipConfigurationStepsToIndexMap.ASSIGN; break;
      case RelationshipConfigurationSteps.CONFIGURE: this.current = RelationshipConfigurationStepsToIndexMap.CONFIGURE; break;
    }
  }

  navigateBack() {
    this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_SECTION_CONFIG]);
  }

  ngOnDestroy() {
    this.displayRelationshipConfiguration = false;
    this.subs.unsubscribe();
  }

}
