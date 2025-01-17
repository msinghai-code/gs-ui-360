/**
 * Created by hkillari on 2024-06-25
 */

import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { NzI18nService } from "@gs/ng-horizon/i18n";
import * as spacing from '@gs/design-tokens/spacings';
 @Component({
  selector: 'action-column-renderer',
  template: `<a *ngIf="actionLabels && actionLabels.length > 0"
                [nzDropdownMenu]="menu" nz-dropdown [nzPlacement]="'bottomRight'" nzTrigger="click" class="gs-more-horizontal-icon">
                <i nz-icon nzType="more-horizontal" nzTheme="general" nzSize="24"></i>
             </a>
              <nz-dropdown-menu #menu="nzDropdownMenu">
                <ul nz-menu>
                  <li *ngFor="let item of actionLabels" nz-menu-item (click)=onAction(item.type)>{{item.label | transloco}}</li>
                </ul>
              </nz-dropdown-menu>
              `,
  styles: [`
          .gs-more-horizontal-icon {
            display: none;
            padding-top: ${spacing.spaceMedium};
          }
          `]
  })
 
 export class ActionColumnRenderer {

  params:any;
  actionLabels: any = [];

   constructor(@Inject("envService") private env: EnvironmentService, private i18nService: NzI18nService) {}

   agInit(params: any): void {
    this.params = params;
    this.actionLabels = this.params && this.params.colDef && this.params.colDef.actionLabels;
   }

   onAction(type){
    this.params.onClick(type.toUpperCase(), this.params.data);
   }
 
   refresh(): boolean {
     return false;
   }
 
 }
