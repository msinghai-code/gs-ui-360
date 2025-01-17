import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { LazyElementsModule } from '@angular-extensions/elements';

import { AppComponent } from './app.component';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { DescribeModule } from '@gs/gdk/services/describe'
import { Gs360AppLinkModule, Gs360AppLinkService} from "@gs/gdk/directives";

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        LazyElementsModule,
        NzNotificationModule,
        EnvironmentModule,
        DescribeModule,
        Gs360AppLinkModule
    ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers:[Gs360AppLinkService]
})
export class AppModule { }
