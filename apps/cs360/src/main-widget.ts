import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {WidgetModule} from "./app/widget/widget.module";
import {LicenseManager} from "@ag-grid-enterprise/core";
import {environment} from "./environments/environment";
import { ɵWebAnimationsDriver } from '@angular/animations/browser';


LicenseManager.setLicenseKey(atob((environment as any).NG_APP_AG_GRID_KEY));

platformBrowserDynamic().bootstrapModule(WidgetModule, { ngZone: (window as any).ngZone })
  .catch(err => console.error(err));


// ViewEncapsulation.ShadowDom breaks Angular Animations #25672
// This monkey-patch fixes it for the web animations case:
// https://github.com/angular/angular/issues/25672#issuecomment-560413034
ɵWebAnimationsDriver.prototype.containsElement = (el1: any, el2: any) => {
  // Travel up the tree to the root node.
  let elem = el2;
  while (elem && elem !== document.documentElement) {
    if (elem === el1)
      return true;
    elem = elem.parentNode || elem.host;
  }
  return false;
};