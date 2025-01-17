import { Component, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';
import { isEmpty } from "lodash";
import {debounceTime, distinctUntilChanged, filter, map} from "rxjs/operators";
import {RelationshipSectionConfigurationService, SharedLayoutRouteOutletService} from "../relationship-layout-configuration.service";
import { APPLICATION_ROUTES, IRelationshipConfig } from '@gs/cs360-lib/src/common';
// import {IRelationshipConfig} from "../relationship-configuration";
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { MessageType } from '@gs/gdk/core';
// import { CS360Service} from "@gs/cs360-lib";
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-relationship-configuration-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss']
})
export class AssignComponent implements OnInit {

  public loading = false;
  public checkboxOptions = {
    allChecked: false,
    disabled: false,
    updateAllChecked: this.updateAllChecked.bind(this),
    indeterminate: false,
    data: [],
    updateSingleChecked: this.updateSingleChecked.bind(this),
    loader: false
  }
  public searchControl = new FormControl();
  public name = new FormControl(null, [Validators.required, Validators.maxLength(50), extraSpaceValidator]);
  private relationshipTypeIds: string[] = [];
  private originalData: any[];
  private subs = new SubSink();
  private configId: string = 'new';
  noTypeSelected;
  showTypeError;
  changesMade = false;

  set _data(data) {
    this.originalData = data;
  }

  get _data() {
    return this.originalData;
  }

  get checkedTypes(): number {
    return this.getSelectedRelationshipTypes().length || 0;
  }

  constructor(private relationshipSectionConfigurationService: RelationshipSectionConfigurationService,
              private router: Router,
              private c360Service: CS360Service,
              private sharedRouteOutletService: SharedLayoutRouteOutletService,
              private route: ActivatedRoute,
              private i18nService : NzI18nService) { }

  ngOnInit() {
    this.routeSubscriber();
    this.searchSubscriber();
    this.fetchAllRelationshipTypes();

    this.name.valueChanges.subscribe(value => {
      this.changesMade = true;
    })
  }

  routeSubscriber() {
    this.subs.add(this.route.parent.data.subscribe(routeData => {
      const { data } = routeData;
      const { name, relationshipTypeIds } = !isEmpty(data.config) ? <any>{...data.config, ...window.history.state}: window.history.state;
      const { params } = this.route.parent.snapshot;
      this.configId = params.configId || 'new';
      this.name.setValue(name);
      this.relationshipTypeIds = relationshipTypeIds;
      // Fail check for header update.
      //{360.admin.assign.new_relationship_section}="New Relationship Section View"
      this.sharedRouteOutletService.emitChange(name || this.i18nService.translate('360.admin.assign.new_relationship_section'));
    }));
  }

  searchSubscriber() {
    this.searchControl.valueChanges
        .pipe(
            map(searchTerm => searchTerm.trim().toLowerCase()),
            filter(searchTerm => searchTerm.length >= 1 || searchTerm.length === 0),
            debounceTime(400),
            distinctUntilChanged(),
        )
        .subscribe((searchTerm) => {
          this.checkboxOptions.data = this._data.filter(s => s.label.toLowerCase().includes(searchTerm));
          this.disabledAllChecked(this.checkboxOptions.data);
        });
  }

  fetchAllRelationshipTypes() {
    this.checkboxOptions.loader = true;
    this.relationshipSectionConfigurationService
        .fetchAllRelationshipTypes(this.configId)
        .subscribe((types = []) => {
          this.checkboxOptions.loader = false;
          this._data = this.checkboxOptions.data = !!this.relationshipTypeIds ? types.map(t => {
            return {
              ...t,
              checked: this.relationshipTypeIds.includes(t.value)
            }
          }): types;
          this.updateSingleChecked();
          this.disabledAllChecked(this.checkboxOptions.data);
        })
  }

  updateAllChecked() {
    this.checkboxOptions.indeterminate = false;
    this.changesMade = true;
    if (this.checkboxOptions.allChecked) {
      this.checkboxOptions.data = this.checkboxOptions.data.map(item => {
        if(!item.disabled) {
          return {
            ...item,
            checked: true
          };
        }
        return item;
      });
    } else {
      this.checkboxOptions.data = this.checkboxOptions.data.map(item => {
        if(!item.disabled) {
          return {
            ...item,
            checked: false
          };
        }
        return item;
      });
    }
    // Updated the original data list
    this._data = this.originalData.map(o => {
      const option: any = this.checkboxOptions.data.find(d => d.value === o.value);
      return {...o, ...option};
    });
  }

  updateSingleChecked() {
    this.validateRelationshipTypes();

    if (this.checkboxOptions.data.filter(f=>!f.disabled).every(item => !item.checked)) {
      this.checkboxOptions = {
        ...this.checkboxOptions,
        allChecked: false,
        indeterminate: false
      }
    } else if (this.checkboxOptions.data.filter(f=>!f.disabled).every(item => item.checked)) {
      this.checkboxOptions = {
        ...this.checkboxOptions,
        allChecked: true,
        indeterminate: false
      }
    } else {
      this.checkboxOptions = {
        ...this.checkboxOptions,
        indeterminate: true
      }
    }
    // Updated the original data list
    this._data = this.originalData.map(o => {
      const option: any = this.checkboxOptions.data.find(d => d.value === o.value);
      return {...o, ...option};
    });
  }

  disabledAllChecked(data: any[]) {
    this.checkboxOptions = {
      ...this.checkboxOptions,
      disabled: data.length === 0
    }
  }

  validateRelationshipTypes() {
    this.noTypeSelected = this.getSelectedRelationshipTypes().length === 0;
    this.showTypeError = false;
  }

  onNextClick() {
    this.validateRelationshipTypes();
    if(this.name.valid && !this.noTypeSelected) {
      // Redirect to section configure page
      const state: IRelationshipConfig = {
        name: this.name.value,
        relationshipTypeIds: this.getSelectedRelationshipTypes()
      }
      this.changesMade = false;
      this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_CONFIGURE(this.configId || 'new')], { state: state });
    } else {
      this.submitForm();
      this.showTypeError = true;
      // this.openToastMessageBar({message: error.message, action: null, messageType: MessageType.ERROR});
    }
  }

  getSelectedRelationshipTypes(): string[] {
    return !!this._data ? this._data.filter(f=>!!f && f.checked && !f.disabled).map(c=>c.value): [];
  }

  submitForm(): void {
    this.name.markAsDirty();
    this.name.updateValueAndValidity();
  }

  onCancelClick() {
    this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_SECTION_CONFIG]);
  }

  private openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

  public isConfigurationChanged(): boolean {
    return this.changesMade && this.configId !== 'new';
  }

}
