import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AddAssociationContentComponent } from '@gs/cs360-lib/src/common';
import { AssociationConfigInfo } from '@gs/cs360-lib/src/common';
import { ViewChild } from '@angular/core';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'gs-add-association',
  templateUrl: './add-association.component.html',
  styleUrls: ['./add-association.component.scss']
})
export class AddAssociationComponent implements OnInit {

  @Input() associationConfigInfo: AssociationConfigInfo;
  @Input() isBasicConfigEditable = true;
  @Input() showAddAssoc: boolean = true;

  @Output() onSaveOrCancel = new EventEmitter();
  @ViewChild('aac', { static: false }) private aac: AddAssociationContentComponent;

  relationshipTypes = [];

  constructor(@Inject('envService') private _env: EnvironmentService) {
    this.relationshipTypes = cloneDeep(this._env.moduleConfig.relationshipTypes);
  }

  ngOnInit() {

  }

  onSave() {
    this.aac.onSave();
  }

  onCancel() {
    this.showAddAssoc = false;
    this.onSaveOrCancel.emit();
  }

  onAddAssocAction(event) {
    this.onSaveOrCancel.emit(event);
  }

}

