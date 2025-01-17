import { Component, Input, forwardRef, Output, EventEmitter, ElementRef, HostBinding, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const DATE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true
};

export interface IPicklistOption{
  value:string | boolean;
  label:string;
  active:boolean;
  selected?:boolean;
  color?:string;
  disabled?:boolean;
}

@Component({
  selector: 'gs-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [DATE_VALUE_ACCESSOR]
})
export class SelectComponent implements  ControlValueAccessor, AfterViewInit {
  @Input() options:IPicklistOption[] = [];
  @Input() isSingle = true;
  @Input() showColor = true;
  @Input() openDropdown = true;
  @Input() dropdownDisabled = false;
  @Input() required = false;
  @Input() placeHolder = '';
  @Input() showArrow = false;
  @Output() valueSelected = new EventEmitter<{target:any}>();

  @HostBinding('attr.tabindex') tabindex = '1';

  selectedValue:string | boolean | string[] ;
  selectedOption:IPicklistOption | IPicklistOption[];
  disabled = false;
  expandSelect = false;
  allowClear = true;

  constructor(private hostElement:ElementRef) { }
  private propagateFn;

  private touchedFn;

  ngAfterViewInit(){
    this.expandSelect = this.openDropdown ? true : null;
    this.allowClear = !this.required;
  }

  writeValue(obj: any): void {
    this.selectedValue = obj;
    this.setSelectedOption(this.selectedValue);
  }

  registerOnChange(fn: any): void {
    this.propagateFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange(evt){
    this.setSelectedOption(evt);

    // On dropdown clear
    if(!this.selectedOption) {
      this.onOpenChange(false);
    }
  }

  private setSelectedOption(evt){
    if(this.isSingle){
      this.selectedOption = (this.options||[]).find(opt => (opt.value === this.selectedValue) || opt.selected);
    } else {
      this.selectedValue = ((this.selectedValue || []) as string[]).length > 0 ? this.selectedValue : null;
      this.selectedOption = (this.options||[]).filter(option => {
        option.selected = this.selectedValue && (this.selectedValue as string[]).indexOf(option.value as string) > -1;
        return option.selected;
      });
    }
  }
  onOpenChange(isDropdownOpen:boolean){
    if(!isDropdownOpen){
      this.propagateFn(this.selectedValue);
      // this.hostElement.nativeElement.focus();
      this.valueSelected.emit({target:this.hostElement.nativeElement});
    }
  }

  /**
   * This will be called on Unchecking in Multi Select Dropdown
   */
}
