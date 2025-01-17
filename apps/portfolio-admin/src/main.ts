import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import {LicenseManager} from "@ag-grid-enterprise/core";
import {environment} from "./environments/environment";


LicenseManager.setLicenseKey(atob((environment as any).NG_APP_AG_GRID_KEY));

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
