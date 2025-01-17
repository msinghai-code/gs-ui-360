import {Component, Inject, Input, OnInit, ViewChild } from '@angular/core';

import {ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO, RegistrationService} from '@gs/cs360-lib/src/common';
import AdminSectionInterface from '../modules/AdminSectionInterface';

import { SectionConfigurationService } from "../../layout-configuration/section-configuration/section-configuration.service";

@Component({
  selector: 'gs-360-admin',
  templateUrl: './base-admin-section-renderer.component.html',
  styleUrls: ['./base-admin-section-renderer.component.scss']
})
export class BaseAdminSectionRendererComponent implements OnInit, AdminSectionInterface {
  elementTag: string;
  url: string;
  @Input() section;
  @ViewChild('adminSection', {static: false} ) adminSection: any;
  updatedConfig = null;

  constructor(@Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private sectionConfigurationService: SectionConfigurationService,
              private rs: RegistrationService){

  }

  ngOnInit() {
    this.elementTag = this.rs.getElementTag("SECTION_ADMIN",this.ctx.pageContext, this.section.sectionType);
    this.url = this.rs.getModuleUrl("SECTION_ADMIN",this.ctx.pageContext,this.section.sectionType);
  }

  showFooter(){
    return true; //REGISTERED_ADMIN_SECTIONS[this.ctx.pageContext][this.section.sectionType].props.showFooter;
  }

  toJSON() {
    return this.adminSection.nativeElement.toJSON() || {}//this.updatedConfig || {};
  }

  validate() {
      // This function gets called before any section save call in order to check whether all information in the section has been validated
      return this.adminSection.nativeElement ?  this.adminSection.nativeElement.validate() : true;
  }

  showLoader() {

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
}
