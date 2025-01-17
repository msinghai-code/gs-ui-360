import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MultipleAssociationsAdditionContentComponent } from '@gs/cs360-lib/src/common';
import { AssociationCondition, AssociationConfigInfo, MultipleAssociationConfigInfo } from '@gs/cs360-lib/src/common';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { cloneDeep } from 'lodash';
interface AssociationConfigInfoForMultiple extends AssociationConfigInfo {
  allConfigs?: {conditions: AssociationCondition[]; targetObjectName: string; targetObjInfo: any}[];
  selectedObjectInfo?: any;
  isResetPopupVisible?: boolean;
}
@Component({
  selector: 'gs-multiple-associations-addition',
  templateUrl: './multiple-associations-addition.component.html',
  styleUrls: ['./multiple-associations-addition.component.scss']
})
export class MultipleAssociationsAdditionComponent implements OnInit {
  
  @Input() multipleAssociationConfigInfo: MultipleAssociationConfigInfo;
  @Input() showAddAssoc: boolean = true;
  
  @Output() onSaveOrCancel = new EventEmitter();
  @ViewChild('maac', { static: false }) private maac: MultipleAssociationsAdditionContentComponent;
  relationshipTypes = [];

  constructor(@Inject('envService') protected _env: EnvironmentService) {
    this.relationshipTypes = cloneDeep(this._env.moduleConfig.relationshipTypes);
  }
  ngOnInit() {

  }

  onSave() {
    this.maac.onSave();
  }

  onCancel() {
    this.showAddAssoc = false;
    this.onSaveOrCancel.emit();
  }

  onAddAssocAction(event) {
    this.onSaveOrCancel.emit(event);
  }

}
