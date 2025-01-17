import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as crudActions from '../store/merge.actions';

@Component({
  selector: 'gs-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent implements OnInit {

  public state;
  constructor(private store:Store<any>) { 

  }

  ngOnInit() {
    this.store.dispatch(new crudActions.SetRoutePath(1));
    
  }

}
