import { Component, OnInit, Input } from '@angular/core';
import { NetworkaccessFacade } from '../network-access/state/networkaccess.facade';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NETWORK_ACCESS_CONSTS } from '../network-access.constant';
import { cloneDeep } from 'lodash';
import { NzModalRef } from '@gs/ng-horizon/modal';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-add-edit-iprange',
  templateUrl: './add-edit-iprange.component.html',
  styleUrls: ['./add-edit-iprange.component.scss']
})
export class AddEditIPRangeComponent implements OnInit {

  @Input() data: any;
  ipRangeFormGroup: FormGroup;
  address = new FormControl('', [Validators.required, Validators.pattern(NETWORK_ACCESS_CONSTS.IP_PATTERN), this.addressValidator.bind(this)]);
  description = new FormControl('');
  allIPRange: any;
  configurationResponse :any;
  oldIpAddress;

  constructor(public dialogRef: NzModalRef, private networkaccessFacade: NetworkaccessFacade, private formBuilder: FormBuilder, private i18nService: NzI18nService) {
  }

  constructIPForm() {
    this.ipRangeFormGroup = this.formBuilder.group({
      address: this.address,
      description: this.description,
    });
  }

  ngOnInit() {
    this.oldIpAddress = this.data && this.data.address
    this.constructIPForm();
    this.networkaccessFacade.getConfiguration$.subscribe(response => {
      if (response) {
        this.configurationResponse = cloneDeep(response);
      }
    });
    this.networkaccessFacade.allIPRange$.subscribe(value => { this.allIPRange = value; });
  }



  onSave(value) {
      if (this.ipRangeFormGroup.valid) {
          const payload = {
              action: value === this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DIALOG_ADD_TITLE') ? 'ADD' : 'EDIT',
              data: {
                  oldIpAddress: this.oldIpAddress,
                  address: this.data && this.data.address,
                  description: this.data && this.data.description,
                  byPassMobile : this.data.byPassMobile
              },
              stateData: this.configurationResponse
          };
          this.networkaccessFacade.upsertConfiguration(payload);
          this.dialogRef.destroy({});
      } else {
          this.ipRangeFormGroup.get('address').markAsTouched({ onlySelf: true });
          this.ipRangeFormGroup.get('description').markAsTouched({ onlySelf: true });
          return false;
      }
  }

  addressValidator(control) {
    const ipAddress = control.value;
    if (ipAddress && ipAddress.match(NETWORK_ACCESS_CONSTS.IP_PATTERN)) {
      const range = this.allIPRange ? this.allIPRange.find(x => x.address === ipAddress && this.data.address != ipAddress) : null;
      if (range) {
        return {
          rangeExist: true
        };
      }
    }
    return null;
  }

}
