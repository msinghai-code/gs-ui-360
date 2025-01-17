import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import { StateAction } from '@gs/gdk/core';

@Component({
  selector: 'gs-inline-input-editor',
  templateUrl: './inline-text-editor.component.html',
  styleUrls: ['./inline-text-editor.component.scss']
})
export class InlineTextEditorComponent implements OnInit, OnChanges {

  @Input() text: string;
  @Input() item: any;
  @Output() action = new EventEmitter<StateAction>();

  @ViewChild('input', { static: false}) inputElement: ElementRef;

  public editable: boolean = false;
  public label = new FormControl(null, [Validators.maxLength(90)]);
  public fieldPathLabel: string = null;

  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if(!event.target.closest('.gs-inline-text-editor--label')
        && !event.target.closest('.gs-inline-text-editor--input')
        && this.editable) {
      if(!this.label.value) {
        return;
      }
      this.editable = false;
      this.action.emit({
        type: 'TEXT_EDITED',
        payload: this.label.value
      })
    }
  }

  constructor() { }

  ngOnInit() {
    this.bootstrapComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.text && changes.text.firstChange) return;
    if(changes.text && changes.text.currentValue !== changes.text.previousValue) {
      this.label.setValue(changes.text.currentValue, {emitEvent: false});
    }
  }

  bootstrapComponent() {
    this.label.setValue(this.text, {emitEvent: false});
  }

  onEdit(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if(!!event.stopPropagation) {
      event.stopPropagation();
    }
    this.editable = true;
    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    });
  }

  onBlur(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.editable = false;
    if(!this.label.value) {
      this.label.setValue(this.text, {emitEvent: false});
    }
    this.action.emit({
      type: 'TEXT_EDITED',
      payload: this.label.value
    });
  }

  onEsc(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.editable = false;
    this.label.setValue(this.text, {emitEvent: false});
  }

}
