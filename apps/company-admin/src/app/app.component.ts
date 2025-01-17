import { Component, ViewChild, OnInit, Inject } from '@angular/core';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import {GSWindow} from "@gs/gdk/core/types";
declare let window: GSWindow;

@Component({
  selector: 'gs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'objects-company-admin';
  moduleLoading = false;
  chromeLess = false;
  inFrame = false;

  private SNACKBAR_DURATION = 5000;

  constructor(
    private _store: Store<any>,
    private _snackBar: MatSnackBar,
    @Inject("envService") private _env: EnvironmentService,
    private _router: Router
  ) {
    this.chromeLess = (window.urlParams || {})['chromeLess'] + '' === 'true';
    // this._store.dispatch(new UpdateModuleTitle({ label: 'Objects' }));
  }

  // onActivate(module: IModule) {
  //   if (this.appContainer) {
  //     this.appContainer.manageChild(module);
  //   }
  // }

  ngOnInit(): void {
    //Adding this line since fields are not loading properly - missing config from GS object
    //@ts-ignore
    // this._env.updateConfig(window.GS.userConfig.user, window.GS.userConfig.host, window.GS.userConfig.instance, window.GS.userConfig.user);
    this._router.events.subscribe(evt => {
      if (evt instanceof RouteConfigLoadStart) {
        this.moduleLoading = true;
      } else if (evt instanceof RouteConfigLoadEnd) {
        this.moduleLoading = false;
      }
    });

    // this._store.select('globalMessage').subscribe(msgObj => {
    //   if (msgObj !== null) this.openSnackBar(msgObj.message);
    // });

    // this._store.dispatch(new LoadAppConfig(this._env.host));
  }

  // openSnackBar(message: string, action: string = '') {
  //   if (message !== null)
  //     this._snackBar.open(message, action, {
  //       duration: this.SNACKBAR_DURATION
  //     });
  // }
}
