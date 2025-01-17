import { Component, OnInit } from '@angular/core';
import * as crudActions from '../store/merge.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'gs-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  constructor(private store:Store<any>) { }

  ngOnInit() {
    
    this.store.dispatch(new crudActions.SetRoutePath(2));
  }

}
