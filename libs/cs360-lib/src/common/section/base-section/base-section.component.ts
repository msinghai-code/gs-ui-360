import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter
} from '@angular/core';
import { AbstractBaseSectionRenderer } from './AbstractBaseSectionRenderer';
import { ISection } from "../section-renderer/section-renderer";
import { SECTION_EVENTS } from "../section-renderer/section-renderer.constants";

@Component({
  selector: 'gs-base-section',
  template: ``,
  encapsulation: ViewEncapsulation.None
})
export class BaseSectionComponent extends AbstractBaseSectionRenderer implements OnInit {

  @Input() section: ISection;

  @Input() properties: any;

  @Input() sectionElement: HTMLElement;

  @Output() changes: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void { }

  setSectionLoaded() {
    this.changes.emit({ type: SECTION_EVENTS.SECTION_LOAD_SUCCESS, payload: { section: this.section } });
  }
}
