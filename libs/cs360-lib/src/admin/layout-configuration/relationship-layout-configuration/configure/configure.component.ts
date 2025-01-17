import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmpty } from "lodash";
import { SubSink } from 'subsink';
import { APPLICATION_ROUTES, IRelationshipConfig } from '@gs/cs360-lib/src/common';
// import {IRelationshipConfig} from "../relationship-configuration";
import {RelationshipSectionConfigurationService, SharedLayoutRouteOutletService} from "../relationship-layout-configuration.service";
import {SummaryRibbonConfigComponent} from "./summary-ribbon-config/summary-ribbon-config.component";
import {ListViewConfigComponent} from "./list-view-config/list-view-config.component";
import {CardViewConfigComponent} from "./card-view-config/card-view-config.component";
import { MessageType } from '@gs/gdk/core';
// import { CS360Service} from "@gs/cs360-lib";
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzI18nService} from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent implements OnInit {

  @ViewChild(SummaryRibbonConfigComponent, {static: false}) summaryRibbonConfigComponentRef: SummaryRibbonConfigComponent;
  @ViewChild(ListViewConfigComponent, {static: false}) listViewConfigComponentRef: ListViewConfigComponent;
  @ViewChild(CardViewConfigComponent, {static: false}) cardViewConfigComponentRef: CardViewConfigComponent;

  selectedIndex: number = 0;
  isSaveIsInProgress: boolean;
  //{360.admin.configure.summary_ribbon}='Summary Ribbon'
  //{360.admin.configure.list_view}='List View'
  //{360.admin.configure.card_view}='Card View'
  tabs: { label: string, link: string[], name: string, id: string | number, componentRef: any }[] = [
    {
      label:  this.i18nService.translate('360.admin.configure.summary_ribbon') ,
      link: ['summary'],
      name: 'ribbon',
      id: 0,
      componentRef: null
    },
    {
      label: this.i18nService.translate('360.admin.configure.list_view'),
      link: ['list'],
      name: 'list',
      id: 1,
      componentRef: null
    },
    {
      label: this.i18nService.translate('360.admin.configure.card_view'),
      link: ['card'],
      name: 'card',
      id: 2,
      componentRef: null
    }
  ];
  config: IRelationshipConfig;
  configId: string;
  private subs = new SubSink();
  isDefault: boolean = false;
  changesMade = false;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(this.isConfigurationChanged()) {
      event.returnValue = false;
    }
  }

  constructor(private route: ActivatedRoute,
              private location: Location,
              private c360Service: CS360Service,
              private relationshipSectionConfigurationService: RelationshipSectionConfigurationService,
              private router: Router,
              private sharedRouteOutletService: SharedLayoutRouteOutletService,
              private i18nService: NzI18nService) { }

  ngOnInit() {
    this.routeSubscriber();
  }

  routeSubscriber() {
    this.subs.add(this.route.parent.data.subscribe(routeData => {
      // Read it from history state as data is passed from diff route.
      // On refresh, this data will be flushed.
      const { data } = routeData;
      const config: any = !isEmpty(data.config) ? <any>{...data.config, ...window.history.state}: window.history.state;
      const { name, relationshipTypeIds = [] } = config;
      this.isDefault = config.default;
      const {params} = this.route.parent.snapshot;
      this.configId = params.configId || 'new';
      // Redirect logic to assign screen if name and relationshipTypeIds are empty.
      if((!name || relationshipTypeIds && relationshipTypeIds.length === 0) && !this.isDefault) {
        this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_ASSIGN(this.configId)]);
        return;
      }
      this.config = { name, relationshipTypeIds, default: this.isDefault };
      // Fail check for name update.
      this.sharedRouteOutletService.emitChange(name);
    }));
  }

  public isConfigurationChanged(): boolean {
    return this.changesMade;
  }

  onChanges(event?) {
    // 'CUSTOMIZED' event is fired when you open field config (not on field config save). So we can ignore this state for marking changesMade
    if(['CUSTOMIZED'].includes(event.type)) {
      return;
    }

    this.changesMade = true;
  }

  onTabSelect(tab: any) {
      this.listViewConfigComponentRef.updateDisableNodeStatus();
      this.cardViewConfigComponentRef.updateDisableNodeStatus();
    // this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_CONFIGURE_STEPS(this.configId, tab.link[0])], { state: this.config, relativeTo: this.route });
  }

  navigateToAssign() {
    this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_ASSIGN(this.configId)], { state: this.config });
  }

  close() {
    this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_SECTION_CONFIG]);
  }

  save() {
    // Get all tabs config
    const ribbon = this.summaryRibbonConfigComponentRef.serialize();
    const list = this.listViewConfigComponentRef.serialize();
    const card = this.cardViewConfigComponentRef.serialize();
    this.config = {
      ...this.config,
      ribbon, list, card
    }
    if(this.configId !== "new") {
      this.config = {...this.config, viewId: this.configId};
    }
    delete this.config.default;
    this.isSaveIsInProgress = true;
    this.relationshipSectionConfigurationService
        .saveRelationshipConfig(this.config)
        .subscribe((data) => {
          this.isSaveIsInProgress = false;
          if(!isEmpty(data)) {
             //{360.admin.configure.rel_success_message}= 'Relationship configuration saved successfully.'
            this.openToastMessageBar({message: this.i18nService.translate('360.admin.configure.rel_success_message'), action: null, messageType: MessageType.SUCCESS});
            this.changesMade = false;
            this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_SECTION_CONFIG]);
          } else {
             //{360.admin.configure.not_save_config}='Unable to save the configuration.'
            this.openToastMessageBar({message:  this.i18nService.translate('360.admin.configure.not_save_config'), action: null, messageType: MessageType.ERROR});
          }
        });
  }

  private openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

}
