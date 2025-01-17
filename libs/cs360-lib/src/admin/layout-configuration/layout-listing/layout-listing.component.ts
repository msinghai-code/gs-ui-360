import { Component, Inject, OnInit } from '@angular/core';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Router } from '@angular/router';
import { isEmpty } from "lodash";
import {TranslocoService} from "@ngneat/transloco";
import { EnvironmentService } from "@gs/gdk/services/environment"
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-layout-listing',
  templateUrl: './layout-listing.component.html',
  styleUrls: ['./layout-listing.component.scss']
})
export class LayoutListingComponent implements OnInit {

  selectedIndex: number = 0;
  tabs: { label: string, link: string, id: number }[];
  public showRolloutActivationBanner: boolean = false;

  constructor(
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    private router: Router,
    @Inject("envService") private env: EnvironmentService,
    private c360:CS360Service,
    private i18nService: NzI18nService,
    private translocoService:TranslocoService
  ) { }
    // {360.admin.layout_listing.c360Tab}=C360 Layouts
    // {360.admin.layout_listing.r360Tab}=R360 Layouts
    // {360.admin.layout_listing.configurations}=Configurations
  ngOnInit() {
      let isPartner = this.env.gsObject.featureFlags['PARTNER_MANAGEMENT'] && this.ctx.isPartnerUsecaseSupported;
      this.translocoService.selectTranslateObject('360.admin.layout_listing')
          .pipe()
          .subscribe(result => {
              if(isPartner) {
                  this.tabs = [
                      {
                          label: result[this.ctx.layoutTabName],
                          link: 'standard',
                          id: 0
                      },
                      {
                          label: this.i18nService.translate('360.admin.layout_listing.partnerLayoutsTab'),
                          link: 'partner',
                          id: 1
                      },
                      {
                          label: result.configurations,
                          link: 'configurations',
                          id: 2
                      }
                  ];
              }else {
                  this.tabs = [
                      {
                          label: result[this.ctx.layoutTabName],
                          link: 'standard',
                          id: 0
                      },
                      {
                          label: result.configurations,
                          link: 'configurations',
                          id: 1
                      }
                  ];
              }
              const selected = this.tabs.find(tab  => this.router.url.includes(tab.link));
              this.selectedIndex = selected && selected.id;
              this.showRolloutBanner();
          });
  }

  routeToTab(event: any) {
    const selected = this.tabs.find(tab => tab.id === event.index);
    this.router.navigate([selected.link]);
  }

  showRolloutBanner(): void {

    // const c360Revamp: string = this.env.getFeatureFlag("C360_REVAMP");
      const featureFlags = this.env.gsObject.featureFlags;
      const c360Revamp =  featureFlags && featureFlags['C360_REVAMP'];

    if(!isEmpty(c360Revamp)) {
      this.showRolloutActivationBanner = ["MIGRATION_READY", "MIGRATION_DONE"].includes(c360Revamp);
    }

    // const migrationEnabled = ["MIGRATION_READY", "MIGRATION_DONE", "ENABLED"].includes(c360Revamp);

    // if(migrationEnabled) {
    //   this.tabs.push({
    //     label: 'Migration',
    //     link: '/migrate',
    //     id: 2
    //   })
    // }
  }
}
