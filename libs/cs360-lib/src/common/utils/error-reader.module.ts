import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
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
        } = error;
        //{360.error.this_field}= This field
        //{360.error.is_required}= is required
        //{360.error.enter_a_valid}= Enter a valid number
        //{360.error.enter}= Enter
        //{360.error.or_less_decimal}=  or less decimals.
        //{360.error.validation_string}= is not valid, (Type a search string to select one)
        //{360.error.valid_email}= Enter a valid email
        //{360.error.valid_date}= Enter a valid date
        //{360.error.valid_url}=Enter a valid URL
        //{360.error.max_characters}=Maximum characters allowed are
        //{360.error.more_characters}=or more character(s)
        //{360.error.already_exsits}= already exists
        const label = field ? `'${field.label}'` : this.i18nService.translate('360.error.this_field');

        if (required) {
            return label + ' ' + this.i18nService.translate('360.error.is_required');
        }
        else {
            if (number) {
                return this.i18nService.translate('360.error.enter_a_valid');
            } else if (decimal) {
                return  this.i18nService.translate('360.error.enter') + ` ${decimalPlaces || 0}`+ ' ' + this.i18nService.translate('360.error.or_less_decimal');
            } else if (lookup) {
                return label + this.i18nService.translate('360.error.validation_string');
            } else if (email) {
                return this.i18nService.translate('360.error.valid_email');
            } else if (date) {
                return this.i18nService.translate('360.error.valid_date');
            } else if (url) {
                return this.i18nService.translate('360.error.valid_url');
            } else if (maxlength) {
                return    this.i18nService.translate('360.error.max_characters') +` ${maxlength.requiredLength}`;
            } else if (minlength) {
                return   this.i18nService.translate('360.error.enter') +` ${minlength.requiredLength} ` + this.i18nService.translate('360.error.more_characters');
            } else if (duplicate) {
                return label + this.i18nService.translate('360.error.already_exsits');
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
export class ErrorReaderModule { }
