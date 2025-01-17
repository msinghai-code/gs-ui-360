import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {CompactType, GridType} from 'angular-gridster2';
import {GRIDSTER_DEFAULTS} from "@gs/gdk/widget-viewer";
import { StateAction } from '@gs/gdk/core';
import { CONTEXT_INFO, ICONTEXT_INFO } from '../../context.token';

@Component({
  selector: 'gs-360-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit {

  @Input() items: any[];

  @Input() config: any;

  @Output() action = new EventEmitter<StateAction>();

  public options: any;
  public cardItems: any[];
  public isWidget = false;

  constructor(@Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

  ngOnInit() {
    this.bootstrapComponent();
    this.isWidget = this.ctx.isNativeWidget || this.ctx.isSmartWidget;
  }

  bootstrapComponent(): void {
    this.options = {
      ...GRIDSTER_DEFAULTS(false),
      gridType: GridType.VerticalFixed,
      resizable: {
        enabled: false
      },
      margin: 10,
      outerMargin: true,
      compactType: CompactType.CompactUpAndLeft,
      fixedRowHeight: 60,
      minCols: 2,
      maxCols: 2,
      minRows: 6,
      maxRows: 6,
      pushItems: false,
      setGridSize: true,
      scrollToNewItems: false,
      useTransformPositioning: false,
      mobileBreakpoint: 200
    };
  }

  onRelNameClick(item: any) {
    this.action.emit({
      type: "REL_NAME_CLICK",
      payload: {
        target: item
      }
    });
  }

  onMoreOptionClick(evt: MouseEvent | TouchEvent) {
    evt.stopPropagation();
    this.action.emit({
      type: "MORE_OPTIONS",
      payload: {
        target: evt.target,
        items: this.items,
        identifier: this.config.identifier
      }
    });
  }

}
