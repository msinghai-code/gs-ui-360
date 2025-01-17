import { Component, OnInit, QueryList, TemplateRef, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { CompanyHierarchyConfig, CompanyHierarchyViewLabels, FieldSaveProperties, InitialViewInfos, ViewInfo } from '@gs/cs360-lib/src/common';
import { isEmpty, sortBy, cloneDeep, pick } from 'lodash';
import { ISection } from '@gs/cs360-lib/src/common';
import AdminSectionInterface from '../AdminSectionInterface';
import { FieldSelectorComponent } from './field-selector/field-selector.component';
import { SectionConfigurationService } from '../../../layout-configuration/section-configuration/section-configuration.service';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-company-hierarchy-configuration',
  templateUrl: './company-hierarchy-configuration.component.html',
  styleUrls: ['./company-hierarchy-configuration.component.scss']
})
export class CompanyHierarchyConfigurationComponent implements OnInit, AdminSectionInterface {

  @ViewChildren(FieldSelectorComponent) fieldSelectors: QueryList<FieldSelectorComponent>;
  @ViewChild('headerRef', {static: true, read: TemplateRef}) headerRef: TemplateRef<any>;

  views = CompanyHierarchyViewLabels;
  viewInfos: ViewInfo[];
  section: ISection;
  selectedIndex = 0;
  changesMade = false;

  constructor(private sectionConfigurationService: SectionConfigurationService, public i18nService: NzI18nService) { }

  ngOnInit() {
    this.populateSavedConfig();
  }

  getHeaderTemplateInfo() {
    return {className: "gs-section-config-drawer company-hierarchy", template: this.headerRef};
  }

  handleHeaderEvents() {
    this.sectionConfigurationService.emitCloseEvent();
  }

  onChanges() {
    this.changesMade = true;
  }

  isConfigurationChanged() {
    return this.changesMade;
  }

  private populateSavedConfig() {
    this.viewInfos = cloneDeep(InitialViewInfos);
    if(!isEmpty(this.section.config)) {
      this.viewInfos.forEach(view => {
        view.fields = sortBy(this.section.config[view.label], f => f.displayOrder);
      });
    } 
  }

  private prepateSaveConfig() {
    const config: CompanyHierarchyConfig = {};
    this.viewInfos.forEach(view => {
      config[view.label] = view.fields.map((f, index) => {
        f.displayOrder = index;
        f.properties = {...f.properties, sortable: f.meta && f.meta.sortable};
        if(f.scale === undefined) {
          f.scale = f.meta && f.meta.decimalPlaces;
        }
        f.type = "MEASURE";
        return pick(f, FieldSaveProperties);
      });
    });
    return config;
  }

  onMenuChange() {
    this.updateFields();
  }

  toJSON() {
    this.updateFields();
    return this.prepateSaveConfig();
  }

  updateFields() {
    if(this.section.layoutId) {
      // for this case, there is only 1 fieldSelector instance being used for list and chart
      this.viewInfos[this.selectedIndex].fields = this.fieldSelectors.first.getFields();
    } else {
      this.viewInfos[this.selectedIndex].fields = this.fieldSelectors.toArray()[this.selectedIndex].getFields();
    }
      this.viewInfos = cloneDeep(this.viewInfos);
  }

  validate() {
    return true;
  }

  showLoader() {
    
  }

}
