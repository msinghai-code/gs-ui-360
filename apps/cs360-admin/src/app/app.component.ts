
import { Component, OnInit, Inject } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { EnvironmentService } from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  appConfigLoaded = false;
  navigationItems = [];
  appTitle: string = "";

  constructor(@Inject("envService") public env: EnvironmentService, private router: Router, private i18nService: NzI18nService) {
    // this.navigationItems = this.env.getGS().adminNavigationItems || NAVIGATION_ITEMS;
    // this.store.dispatch(new UpdateModuleTitle({ label: "Company" }));
    this.appTitle =  this.i18nService.translate('360.admin.app_comp.c360AppTitle');
    HybridHelper.setPageTitle(this.i18nService.translate('360.admin.app_comp.c360AppTitle'));
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
      // this.env.updateConfig(window.GS.userConfig.user, window.GS.userConfig.host, window.GS.userConfig.instance, window.GS.userConfig);
    // this.subscribeForActions();
    // this.store.dispatch(new LoadAppConfig(this.env.host));
  }

  protected hasElementsLoaded(){
    return [customElements.whenDefined('gs-app-sidenav'), customElements.whenDefined('gs-app-header')]
  }

  // protected async prepareIconService() {
  //   return new Promise((resolve, reject) => {
  //     this.actions.pipe(ofType(LOAD_CONFIG_SUCCESS), map((c: any) => c)).subscribe( v => {
  //       if (environment.production) {
  //         const {cdnPath, autonomousUrls} = this.env.gsObject;
  //         if (autonomousUrls && 'cs360-admin' in autonomousUrls) {
  //           this.is.changeAssetsSource(autonomousUrls['cs360-admin']);
  //         } else {
  //           this.is.changeAssetsSource(cdnPath);
  //         }
  //       } else {
  //         this.is.changeAssetsSource(window.location.origin);
  //       }
  //       resolve(true);
  //     });
  //   });
  //
  // }

  // subscribeForActions() {
  //   this.actions.pipe(ofType(LOAD_CONFIG_SUCCESS), map((c: any) => c)).subscribe(v => {
  //     this.is.changeAssetsSource(this.env.gsObject.cdnPath);
  //     // this.appConfigLoaded = true;
  //   });
  //   this.store.select("globalMessage").subscribe((msgObj) => {
  //     if (msgObj) {
  //       // this.openToastMessageBar(msgObj);
  //         this.message.info(msgObj);
  //     }
  //   });
  // }

//   onAppContainerReady = () => {
//     this.appConfigLoaded = true;
// }

  // public openToastMessageBar({ message, action = "", messageType }) {
  //   if (message !== null) {
  //     this.tms.add(message, messageType, action, { duration: 5000 });
  //   }
  // }
}
