import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FieldTreeComponent } from '@gs/gdk/field-tree';
import { FieldTreeViewActions, FieldTreeViewOptions } from '../../pojo/field-tree-view-wrapper.interface';
import {GSField} from "@gs/gdk/core";

@Component({
  selector: 'gs-field-tree-view-wrapper',
  templateUrl: './field-tree-view-wrapper.component.html',
  styleUrls: ['./field-tree-view-wrapper.component.scss']
})
export class FieldTreeViewWrapperComponent implements OnInit, OnChanges {

  @Input() treeOptions: FieldTreeViewOptions;
  @Input() fnCheckForDisable;
  
  @Output() actions = new EventEmitter<{action: string; info: any}>();

  @ViewChild(FieldTreeComponent, { static: false }) fieldTree: FieldTreeComponent;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.treeOptions && changes.treeOptions.currentValue) {
      this.treeOptions.resolveMultipleLookups = this.treeOptions.resolveMultipleLookups || {};
      // the disabled fields are not getting updated on page load automatically
      this.updateDisableStatusOfNodes();
    }
  }

  emitSelectedFieldChange(event: any) {
    this.actions.emit({action: FieldTreeViewActions.SelectedFieldChange, info: event});
  }

  emitBaseObjUpdate(event: any) {
    this.actions.emit({action: FieldTreeViewActions.BaseObjUpdate, info: event});
  }

  emitNodeExpand(event: any) {
    this.actions.emit({action: FieldTreeViewActions.NodeExpand, info: event});
  }

  emitBaseTreeAction(event: any) {
    this.actions.emit({action: FieldTreeViewActions.BaseTreeAction, info: event});
  }

  updateDisableStatusOfNodes() {
    if(this.fieldTree) {
      this.fieldTree.updateDisableStatusOfNodes();
    }
  }

  setSelectedField(fieldInfo: GSField | GSField[]): void {
    setTimeout(() => {
      if(this.fieldTree) {
        this.fieldTree.setSelectedField(fieldInfo, false, false);
        this.cdr.detectChanges();
      }
    })
  }

}
