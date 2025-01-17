/**
 * Created by rpal on 2021-02-22
 */
import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import { EnvironmentService } from "@gs/gdk/services/environment"
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { NzIconService } from "@gs/ng-horizon/icon";
import {CONTEXT_INFO, ICONTEXT_INFO, PX_CONSTANTS, PX_CUSTOM_EVENTS, PxService, resolveSFWidgetProperties, CS360Service} from '@gs/cs360-lib/src/common';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { isEmpty } from 'lodash';

@Component({
  selector: 'gs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  // @ViewChild(ContainerComponent, { static: false })
  // private appContainer: ContainerComponent;
  public showSearch = true;
  appConfigLoaded = false;
  // navigationItems = [];
  showHeader: boolean;
  showSideNav: boolean;
  appTitle = "";

  constructor(private store: Store<any>,
    private actions: Actions,
    private c360Service: CS360Service,
    private iconService: NzIconService,
    public pxService: PxService,
    private router: Router,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    @Inject("envService") public env: EnvironmentService
    ) {
    // this.navigationItems = this.env.getGS().adminNavigationItems || NAVIGATION_ITEMS;

    this.appTitle =  this.ctx.pageContext;
    // HybridHelper.setPageTitle(document.title);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      try {
        HybridHelper.updateHostHash(event.url);
        console.info('Hash updated to', event.url);
      } catch (e) {
        console.error('Unable to update hash!!!.');
      }
    });
  }

  ngOnInit(): void {
    //Adding this line since fields are not loading properly - missing config from GS object
    //@ts-ignore
    // this.env.updateConfig(window.GS.userConfig.user, window.GS.userConfig.host, window.GS.userConfig.instance, window.GS.userConfig.user);
    // PX custom event for page visits
    const widgetProperties = resolveSFWidgetProperties();
    this.showHeader = !(widgetProperties.isNativeWidget === "true");
    this.showSideNav = !(widgetProperties.isNativeWidget === "true");
  }

    ngAfterViewInit() {
        const widgetProperties = resolveSFWidgetProperties();
        const source = this.getSource();
        const eventName = PX_CUSTOM_EVENTS.PAGE_VISITS(this.ctx.pageContext);

        if (widgetProperties.isNativeWidget === "true"&& window['GS'] && window['GS'].query_params && (window['GS'].query_params.hasOwnProperty('showSally') && !isEmpty(window['GS'].query_params['showSally']))) {
            console.log('gainsight_smart_widget_loaded', eventName, source)
            this.pxService.pxAptrinsic('gainsight_smart_widget_loaded',{source});
        } else if(widgetProperties.isNativeWidget === "true" && this.ctx && this.ctx.isNativeWidget){
            console.log('gainsight_account_widget_loaded', eventName, source)
            this.pxService.pxAptrinsic('gainsight_account_widget_loaded',{source});
        }
        this.pxService.pxAptrinsic(eventName,{source});
    }

  getSource() {
        if(!!(this.ctx.sectionName || this.ctx.sectionLabel)){
            return 'SMART_WIDGET';
        } else if(!!this.ctx.dId) {
            return  'DYNAMICS_WIDGET';
        }else if(this.ctx.isNativeWidget){
            return  'SFDC_WIDGET';
        } else {
            return 'GAINSIGHT';
        }

  }

}
