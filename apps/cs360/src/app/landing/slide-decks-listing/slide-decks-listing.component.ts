import {Component, OnInit, Inject, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-slides-listing',
  templateUrl: './slide-decks-listing.component.html',
  styleUrls: ['./slide-decks-listing.component.scss']
})
export class SlideDecksListingComponent implements OnInit {
  elementTag = 'gs-slide-deck-export-element';
  url: string;
  properties;
  tgs;
  @Input() isAuthenticated: boolean;
  @Input() title: string;
  @Output() action = new EventEmitter<any>();

  constructor(@Inject("envService") public env: EnvironmentService, private cdr: ChangeDetectorRef) {
  }

  async ngOnInit() {
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['success-snapshot-elements'] : (await getCdnPath('success-snapshot-elements'));
    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    // this.url = `https://localhost:4200/main.js`; //Point to local host if required
  }

  onAction(action) {
    switch (action.detail.type) {
      case 'SELECT_FOLDER':
        this.cdr.detectChanges();
        this.action.emit(action.detail);
        break;
      case 'DEFAULT_FOLDER':
      case 'CREATE_NEW_FOLDER':
        this.action.emit(action.detail);
        break;
    }
  }

}
