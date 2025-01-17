import { Component, Inject, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmpty, cloneDeep } from "lodash";
import { ADMIN_CONTEXT_INFO, Cs360ContextUtils, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { ISection } from '@gs/cs360-lib/src/common';
import AdminSectionInterface from '../AdminSectionInterface';
import {IReportsConfiguration} from "@gs/report/reports-configuration";
import { FieldConfigurationOptions } from '@gs/cs360-lib/src/common';
import {RelationshipConfigurationService} from "./relationship-configuration.service";
import {RelationshipReportsConfigurationComponent} from "./relationship-reports-configuration/relationship-reports-configuration.component";
import {RELATIONSHIP_SETTINGS_CONFIG} from "./relationship-configuration.constants";
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import { NzI18nService } from '@gs/ng-horizon/i18n';
@Component({
  selector: 'gs-relationship-configuration',
  templateUrl: './relationship-configuration.component.html',
  styleUrls: ['./relationship-configuration.component.scss']
})
export class RelationshipConfigurationComponent implements OnInit, AdminSectionInterface {

  isSaveInProgress: boolean = false;
  section: ISection = {} as ISection;
  fieldConfigOptions: FieldConfigurationOptions = {
    showRollup: false,
    showAggregationType: false,
    showType: true,
    showDecimals: true,
    showNumericSummarization: true,
    showDescription: true
  };
  fields = [];
  configDetails: any;
  public relationshipConfig = {
    reportConfig: {},
    settings: cloneDeep(RELATIONSHIP_SETTINGS_CONFIG(this.i18nService))
  } as any;
  // baseObjectName: string = Cs360ContextUtils.getRelationshipBaseObjectName()
  baseObjectName: string = this.ctx.baseObject;
  public loader: boolean = true;
  changesMade = false;

  @ViewChild(RelationshipReportsConfigurationComponent, { static: false }) relationshipReportsConfigurationCompRef: RelationshipReportsConfigurationComponent;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private relationshipConfigurationService: RelationshipConfigurationService,
              private i18nService: NzI18nService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO) {
  }

  ngOnInit() {
    this.accessRoutes();
    this.fetchRelationshipConfiguration();
  }

  isConfigurationChanged() {
    return this.changesMade;
  }

  configChanged() {
    this.changesMade = true;
  }

  private accessRoutes() {
    this.route.paramMap.subscribe((route: any) => {
      const { params } = route;
      this.configDetails = params;
    });
  }

  private fetchRelationshipConfiguration() {
    this.showLoader(true);
    this.relationshipConfigurationService
        .getSectionDetails(this.configDetails)
        .subscribe((data: IReportsConfiguration) => {
          const { config = {} } = data;
          this.relationshipConfig = !isEmpty(config) ? config: this.relationshipConfig;
          this.loader = false;
        });
  }

  navigateToConfiguration(evt): void {
    evt.preventDefault();
    evt.stopPropagation();
    const url = HybridHelper.generateNavLink(`c360#/${APPLICATION_ROUTES.RELATIONSHIP_SECTION_CONFIG}`);
    if(HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, true);
    }else{
      window.open(url, '_blank');
    }
  }

  showLoader(flag: boolean): void {
    this.isSaveInProgress = flag;
  }

  validate() {
    return this.relationshipReportsConfigurationCompRef.validate();
  }

  toJSON() {
    if(this.validate()) {
      const reportConfig = this.relationshipReportsConfigurationCompRef.serialize();
      const { settings = [] } = this.relationshipConfig;
      return { reportConfig, settings };
    } else {

    }
  }

}

@Pipe({ name: 'filterItems' })
export class FilterItemsPipe implements PipeTransform {
  transform(items: any[], searchText: string, searchProp) {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = (searchText.toLocaleLowerCase() as any);
    return items.filter(item => item[searchProp] && item[searchProp].toLowerCase().includes(searchText));
  }
}
