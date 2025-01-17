import {NgModule, Pipe, PipeTransform} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "keys"
})
export class KeysPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return Object.keys(value);
  }

}


@Pipe({ name: 'safeHTML' })
export class SafeHTMLPipe implements PipeTransform {
  constructor(
    private sanitizer: DomSanitizer,
  ) {}
  transform(text: string) {
    return this.sanitizer.bypassSecurityTrustHtml(text);
  }
}

@NgModule({
  declarations: [
    KeysPipe,
    SafeHTMLPipe
  ],
  exports: [
    KeysPipe,
    SafeHTMLPipe
  ]
})
export class UtilityPipesModule {}
