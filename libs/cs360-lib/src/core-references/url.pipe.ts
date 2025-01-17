import { NgModule, Pipe, PipeTransform } from "@angular/core";

@Pipe ({ name: "url" })
export class FormatUrl implements PipeTransform {
  transform(value: string): string {
    let prefixedUrl: string = value;
    // Fallback for urls if they dont have http/https verbs prefixed.
    if(!!value && !value.match(/^[a-zA-Z]+:\/\//)) {
      prefixedUrl = `https://${value}`;
    }
    return !!value ? `<a href="${prefixedUrl}" target="_blank">${value}</a>` : '-';
  }
}
@NgModule({
  declarations: [ FormatUrl ],
  exports: [ FormatUrl ]
})

export class URLPipeModule {}
