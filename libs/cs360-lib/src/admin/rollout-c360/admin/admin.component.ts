import {Component, Inject, OnInit} from '@angular/core';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-admin-rollout-c360',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminRolloutC360Component implements OnInit {

  isR360Enabled: boolean = false;

  constructor(@Inject("envService") public env: EnvironmentService) { }

  ngOnInit() {
    const GS = this.env.gsObject;
    this.isR360Enabled = GS.isRelationshipEnabled;
  }

}
