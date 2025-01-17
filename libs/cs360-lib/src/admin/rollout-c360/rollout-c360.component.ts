import { Component, OnInit } from '@angular/core';
import { RolloutC360Service } from "./rollout-c360.service";

@Component({
  selector: 'gs-rollout-c360',
  templateUrl: './rollout-c360.component.html',
  styleUrls: ['./rollout-c360.component.scss']
})
export class RolloutC360Component implements OnInit {

  isExplore: boolean = true;

  constructor(private rolloutC360Service: RolloutC360Service) { }

  ngOnInit() {
  }

  startTour() {
    this.isExplore = false;
  }

  skip() {
    this.rolloutC360Service
        .startMigration()
        .subscribe((data) => {
          if(data && data.status === 'STARTED') {
            this.isExplore = false;
          } else {
            // do nothing
          }
        })
  }

}
