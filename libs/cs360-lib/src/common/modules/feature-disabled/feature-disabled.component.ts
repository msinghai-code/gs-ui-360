import { Component, OnInit } from '@angular/core';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-feature-disabled',
  templateUrl: './feature-disabled.component.html',
  styleUrls: ['./feature-disabled.component.scss']
})
export class FeatureDisabledComponent implements OnInit {
// 360.admin.feature_disabled.text = UnAuthorised
// 360.admin.feature_disabled.title = Stay Tuned!
// 360.admin.feature_disabled.subTitle = Some cool stuff is enroute!
  featureDisabledText = {
    text: this.i18nService.translate("360.admin.feature_disabled.text"),
    title: this.i18nService.translate("360.admin.feature_disabled.title"),
    subTitle: this.i18nService.translate("360.admin.feature_disabled.subTitle")
  };

  constructor(public i18nService: NzI18nService) { }

  ngOnInit() {
  }

}
