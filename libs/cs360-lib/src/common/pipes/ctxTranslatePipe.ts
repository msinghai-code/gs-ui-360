import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ICONTEXT_INFO } from '../context.token';
import { IADMIN_CONTEXT_INFO } from '../admin.context.token';

@Pipe({
  name: 'ctxTranslate'
})
export class CtxTranslatePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}
  //eg: {{ 'actions_header.filters' | ctxTranslate: ctx }}
  transform(value: string, ctx: ICONTEXT_INFO | IADMIN_CONTEXT_INFO): string {
    const contextualLabel = value.replace(/^360/, `360.lib.${ctx.pageContext.toLowerCase()}`);
    return this.translocoService.translate(contextualLabel);
  }
}
