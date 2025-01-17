import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'gs-score-view',
  templateUrl: './score-view.component.html',
  styleUrls: ['./score-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreViewComponent implements OnInit, OnChanges {

  @Input() scoringInfo;

  constructor() {}

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

  }
}
