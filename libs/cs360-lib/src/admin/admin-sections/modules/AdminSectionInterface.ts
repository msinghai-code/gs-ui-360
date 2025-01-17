import { TemplateRef } from '@angular/core';

export default interface AdminSectionInterface {
    getHeaderTemplateInfo?(): {className: string, template: TemplateRef<any>};
    getFooterTemplateInfo?(): {className: string, template: TemplateRef<any>};
    showFooter?(): boolean;
    toJSON(): any;
    validate(): any;
    showLoader(flag: boolean): void;
    isConfigurationChanged?(): boolean;
}
