import {Component, Inject, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';

import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import AdminSectionInterface from '../AdminSectionInterface';

import { SectionConfigurationService } from "../../../layout-configuration/section-configuration/section-configuration.service";
import { PageContext } from '@gs/cs360-lib/src/common';
import { ADMIN_NAV_ITEMS, MAP_VIEW_NAV_ITEM, PERSON_MAP_FEATURE_NAME, PEOPLE_C360_ADMIN_FOLDER } from "./people-configuration.constant";
import { EnvironmentService } from '@gs/gdk/services/environment';

import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { peopleConfig } from './people-configuration.config';

@Component({
  selector: 'gs-people-configuration',
  templateUrl: './people-configuration.component.html',
  styleUrls: ['./people-configuration.component.scss']
})
export class PeopleConfigurationComponent implements OnInit, AdminSectionInterface {
  elementTag = 'gs-people-c360-admin';
  url: string;

  @ViewChild('headerRef', {static: true, read: TemplateRef}) headerRef: TemplateRef<any>;
  @Input() section;
  adminViews: { title: string; }[];
  updatedConfig = null;
  selectedIndex = 0;

  constructor(@Inject("envService") public env: EnvironmentService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private sectionConfigurationService: SectionConfigurationService){

  }

  async ngOnInit() {
    // this.url = "https://localhost:4200/main.js";
    this.adminViews = ADMIN_NAV_ITEMS;
    // if(this.ctx.pageContext === PageContext.C360 && this.isMapEnabled()){
    if(peopleConfig[this.ctx.pageContext].addMapViewNav && this.isMapEnabled()){
      this.adminViews = [...this.adminViews, MAP_VIEW_NAV_ITEM];
    }
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls[PEOPLE_C360_ADMIN_FOLDER]
        : (await getCdnPath(PEOPLE_C360_ADMIN_FOLDER));
    this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
  }

  getHeaderTemplateInfo(){
    return {className: "gs-section-config-drawer people", template: this.headerRef};
  }

  showFooter(){
    return false;
  }

  toJSON() {
    return this.updatedConfig || {};
  }

  validate() {
    return true;
  }

  showLoader() {

  }

  handleHeaderEvents() {
    this.sectionConfigurationService.emitCloseEvent();
  }

  handleChange(event) {
    if(event.detail && event.detail.eventType){
      switch(event.detail.eventType){
        case "close":
          this.sectionConfigurationService.emitCloseEvent();
          break;
        case "save":
          this.updatedConfig = event.detail.config;
          this.sectionConfigurationService.emitSaveEvent();
          break;
        case "prebuilt":
          this.updatedConfig = event.detail.config;
          this.sectionConfigurationService.emitPrebuilt();
          break;
        default:
          console.error("Event not handled");
      }
    }

  }

  onTabClick(index) {
    this.selectedIndex = index;
  }

  isMapEnabled(){
    return true;
    // return this.env.getFeatureFlag(PERSON_MAP_FEATURE_NAME);
  }
}
