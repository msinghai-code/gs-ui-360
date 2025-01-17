import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ErrorMessages, IActionParams, LoadToObjectsOperations } from '@gs/rules/core';
import { ActionHeaderComponent } from '@gs/rules/load-to-object';

@Component({
  selector: 'gs-rule-action-header',
  templateUrl: './rule-action-header.component.html',
  styleUrls: ['./rule-action-header.component.scss'],
  providers: [{
    provide: ActionHeaderComponent,
    useExisting: forwardRef(() => RuleActionHeaderComponent)
  }]
})
export class RuleActionHeaderComponent extends ActionHeaderComponent implements OnInit {

  constructor(protected cdRef: ChangeDetectorRef) {
    super(cdRef);
  }
  
  ngOnInit() {
    super.ngOnInit();
    this.supportedOperations = [
      { label: 'Upsert', value: 'upsert' },
      { label: 'Update', value: 'update' }
    ];
    this.operation = this.supportedOperations.find(op => op.value === this.operation) ? this.operation : LoadToObjectsOperations.UPSERT;
    this.config.showCurrencyHonourFlag = true;
  }

  getValidationErrors(): Array<string> {
    const errors = [];
    if (!this.operation) {
      errors.push(ErrorMessages.LOAD_TO_OBJECT.INVALID_OPERATION);
    }
    return errors;
  }

  toSaveJson(): IActionParams {
    const val = {
      ...super.toSaveJson(),
    };
    return val;
  }

}
