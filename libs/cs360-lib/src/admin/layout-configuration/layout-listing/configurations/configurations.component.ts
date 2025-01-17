import { Component, Inject, OnInit } from '@angular/core';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { PageContext } from '@gs/cs360-lib/src/common';
import { Router, ActivatedRoute } from '@angular/router';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss']
})
export class ConfigurationsComponent implements OnInit {

  selectedIndex: number = 0;
  tabs: { label: string, link: string, id: number }[];

  constructor(@Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private router: Router,
              private route: ActivatedRoute,
              @Inject("envService") public env: EnvironmentService,
    private i18nService: NzI18nService) { }

  ngOnInit() {
    const GS = this.env.gsObject;
    // if(this.ctx.pageContext === PageContext.C360) {
    // if(!this.ctx.standardLayoutConfig.groupByType) {
    //     //360.admin.configuration.prebuilt=Pre-built Sections
    //     //360.admin.configuration.relSecViews=Relationship Section Views
    //     //360.admin.configuration.objAssociations=Object Associations
    //   this.tabs = [
    //     {
    //       label: this.i18nService.translate('360.admin.configuration.prebuilt'),
    //       link: 'common',
    //       id: 0
    //     }
    //   ];
    //   if(GS.isRelationshipEnabled) {
    //     this.tabs.push({
    //       label: this.i18nService.translate('360.admin.configuration.relSecViews'),
    //       link: 'relationship',
    //       id: 1
    //     });
    //   }
    // } else {
    //   this.tabs = [
    //     {
    //       label: this.i18nService.translate('360.admin.configuration.prebuilt'),
    //       link: 'common',
    //       id: 0
    //     },
    //     {
    //       label: this.i18nService.translate('360.admin.configuration.objAssociations'),
    //       link: 'associations',
    //       id: 1
    //     }
    //   ];
    // }
    if(this.ctx && this.ctx.layoutConfigurationTabs && this.ctx.layoutConfigurationTabs.length) {  
      this.tabs = this.ctx.layoutConfigurationTabs.map((tab, index) => {
        if (tab.displayIf) {
          const flagValue = eval(tab.displayIf); // Evaluate the displayIf expression
          if (flagValue) {
            return { ...tab, label: this.i18nService.translate(tab.label) }; // Include the tab with translated label
          }
        } else {
          return { ...tab, label: this.i18nService.translate(tab.label) }; // Include the tab with translated label if there's no displayIf
        }
      
        return null; // Exclude the tab from the new array
      }).filter(tab => tab !== null);

      const selected = this.tabs.find(tab  => this.router.url.includes(tab.link));
      this.selectedIndex = selected.id;
    }
  }

  onTabSelected(event: any) {
    const selected = this.tabs.find(tab => tab.id === event.index);
    this.router.navigate([selected.link], {relativeTo: this.route, queryParamsHandling: 'preserve'});
  }

}
