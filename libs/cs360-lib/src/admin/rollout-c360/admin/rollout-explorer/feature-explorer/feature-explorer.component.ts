import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'gs-feature-explorer',
  templateUrl: './feature-explorer.component.html',
  styleUrls: ['./feature-explorer.component.scss']
})
export class FeatureExplorerComponent implements OnInit {

  public selectedFeature: any;

  public featureJukebox: any[] = [
    {
      id: 1,
      iconType: 'dashboard',
      title: '360.admin.feature_explorer.dashboardTitle',
      description: '360.admin.feature_explorer.dashboardDesc',
      embed: this.domSanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/701118239?h=e5c868d006&autoplay=1'),
      selected: true
    },
    {
      id: 2,
      iconType: 'notifications',
      title: '360.admin.feature_explorer.notificationsTitle',
      description: '360.admin.feature_explorer.notificationsDesc',
      embed: this.domSanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/701118399?h=be2de48ec3&autoplay=1'),
      selected: false
    },
    {
      id: 3,
      iconType: 'kanban',
      title: '360.admin.feature_explorer.kanbanTitle',
      description: '360.admin.feature_explorer.kanbanDesc',
      embed: this.domSanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/701118139?h=0aea7cb1b5&autoplay=1'),
      selected: false
    },
    {
      id: 4,
      iconType: 'flag',
      title: '360.admin.feature_explorer.flagTitle',
      description: '360.admin.feature_explorer.flagDesc',
      embed: this.domSanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/701118509?h=73d8a2f705&autoplay=1'),
      selected: false
    }
  ]

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.selectedFeature = this.featureJukebox[0];
  }

  playVideo(feature: any) {
    this.highLightFeature(feature);
    this.selectedFeature = feature;
  }

  highLightFeature(feature: any) {
    this.featureJukebox.forEach(f => {
      if(f.id === feature.id) {
        f.selected = true;
      } else {
        f.selected = false;
      }
    })
  }

}
