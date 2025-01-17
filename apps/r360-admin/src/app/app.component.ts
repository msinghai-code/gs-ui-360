
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import {filter, map} from 'rxjs/operators';
import { NzIconService } from "@gs/ng-horizon/icon";
import { NavigationEnd, Router } from '@angular/router';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // @ViewChild(ContainerComponent, { static: false })
  // private appContainer: ContainerComponent;
  appConfigLoaded = false;
  navigationItems = [];
  appTitle: string = ""

  constructor(private store: Store<any>, private actions: Actions, private is: NzIconService, @Inject("envService") public env: EnvironmentService,private i18nService: NzI18nService, private router: Router) {
    // this.navigationItems = this.env.getGS().adminNavigationItems || NAVIGATION_ITEMS;
    // this.store.dispatch(new UpdateModuleTitle({ label: "Relationship" }));
    this.appTitle =  this.i18nService.translate('360.admin.app_comp.r360appTitle');
    HybridHelper.setPageTitle(this.i18nService.translate('360.admin.app_comp.r360appTitle'));
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
      const {user, host, instance} = this.env.gsObject.userConfig;
      this.env.setEnv({user, host, instance});
    // this.subscribeForActions();
      this.appConfigLoaded = true;
    // this.store.dispatch(new LoadAppConfig(this.env.host));
  }

  // subscribeForActions() {
  //   this.actions.pipe(ofType(LOAD_CONFIG_SUCCESS), map((c: any) => c)).subscribe(v => {
  //     this.is.changeAssetsSource(this.env.getGS().cdnPath);
  //
  //   });
  //
  //   this.store.select("globalMessage").subscribe((msgObj) => {
  //     if (msgObj) {
  //       this.openToastMessageBar(msgObj);
  //     }
  //   });
  // }

  // onActivate(module: IModule) {
  //   this.appContainer.manageChild(module);
  // }

  // public openToastMessageBar({ message, action = "", messageType }) {
  //   if (message !== null) {
  //     this.tms.add(message, messageType, action, { duration: 5000 });
  //   }
  // }
}
