import { Component, Input, OnInit } from '@angular/core';
import { RolloutC360Service } from "../../rollout-c360.service";
import { Router } from "@angular/router";
import {NzNotificationService} from "@gs/ng-horizon/notification";

@Component({
  selector: 'gs-rollout-explorer',
  templateUrl: './rollout-explorer.component.html',
  styleUrls: ['./rollout-explorer.component.scss']
})
export class RolloutExplorerComponent implements OnInit {

    @Input() showFooter: boolean = true;

    public migrationLoader: boolean = false;

    constructor(private rolloutC360Service: RolloutC360Service,
                private notification: NzNotificationService,
                private router: Router) { }

    ngOnInit() {
    }

    proceed() {
      this.migrationLoader = true;
      this.router.navigate(['admin-rollout', 'migrate']);
    }

    learnMore() {
        window.open("https://support.gainsight.com/Gainsight_NXT/07360/New_360_Experience/Admin_Guides", "_blank");
    }


}
