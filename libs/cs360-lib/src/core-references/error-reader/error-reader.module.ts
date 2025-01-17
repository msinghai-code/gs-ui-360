import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { AppInjector } from '../../../../../src/utils/AppInjector';
import { NzI18nService } from '@gs/ng-horizon/i18n';


@Pipe({
  name: 'gsError'
})
export class ErrorReaderPipe implements PipeTransform {
  constructor(private i18nService: NzI18nService) {

  }
  transform(error: any, field?) {
    const {
      required,
      lookup,
      decimal,
      number,
      decimalPlaces,
      email,
      url,
      maxlength,
      minlength,
      date,
      duplicate,
      min,
      max
    } = error;
     //{360.admin.error.this_field}=This field
    const label = field ? `'${field.label}'` : this.i18nService.translate('360.admin.error.this_field');

    if (required) {
       //{360.admin.error.is_required}=is required
      return label +  this.i18nService.translate('360.admin.error.is_required');
    } 
    else if(min) {
      //{360.admin.error.cannot_less_than}=cannot be less than
      return label + this.i18nService.translate('360.admin.error.cannot_less_than') + min.min;
    }
    else if(max) {
      //{360.admin.error.cannot_greater_than}=cannot be greater than
      return label + this.i18nService.translate('360.admin.error.cannot_greater_than') + max.max;
    }
      else {
      if (number) {
        //{360.admin.error.valid_number}=should be a valid number
        return label + this.i18nService.translate('360.admin.error.valid_number');
      } else if (decimal) {
        //{360.admin.error.should_contain}=should contain
        //{360.admin.error.or_less_decimals}=or less decimals
        return label + this.i18nService.translate('360.admin.error.should_contain') + decimalPlaces + this.i18nService.translate('360.admin.error.or_less_decimals');
      } else if (lookup) {
         //{360.admin.error.select_one_string}=is not valid, (Type a search string to select one)
        return label + this.i18nService.translate('360.admin.error.select_one_string');
      } else if (email) {
        //{360.admin.error.valid_email}=is not a valid email
        return label + this.i18nService.translate('360.admin.error.valid_date');
      } else if (date) {
         //{360.admin.error.valid_date}=is not a valid date
        return label + this.i18nService.translate('360.admin.error.valid_date');
      } else if (url) {
        //{360.admin.error.valid_url}=is not a valid url
        return label + this.i18nService.translate('360.admin.error.valid_url');
      } else if (maxlength) {
        const chars = Math.abs(
          maxlength.requiredLength - maxlength.actualLength
        );
         //{360.admin.error.exceeds_by}=exceeds by
         //{360.admin.error.characters}=characters
        return label +  this.i18nService.translate('360.admin.error.exceeds_by') +`${chars}`+ this.i18nService.translate('360.admin.error.characters');
      } else if (minlength) {
        // const chars = Math.abs(minlength.requiredLength - minlength.actualLength);
        // return label + ` is lesser by ${chars} characters`;
        //{360.admin.error.requires}=requires
        //{360.admin.error.or_more_characters}= or more character(s)
        return label + this.i18nService.translate('360.admin.error.requires') +`${minlength.requiredLength}` + this.i18nService.translate('360.admin.error.or_more_characters');
      } else if(duplicate){
        //{360.admin.error.already_exists}=already exists
        return label + this.i18nService.translate('360.admin.error.already_exists');
      }
    }

    // FIXME: this is here to print the raw error to see if something is missing.
    return JSON.stringify(error);
  }
}

@NgModule({
  imports: [CommonModule],
  providers: [],
  declarations: [ErrorReaderPipe],
  exports: [ErrorReaderPipe]
})
export class ErrorReaderModule {}
