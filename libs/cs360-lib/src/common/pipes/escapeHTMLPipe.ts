import { Pipe, PipeTransform } from "@angular/core";
import { unescape } from 'lodash';

@Pipe({ name: 'escapeHTML' })
export class EscapeHTMLPipe implements PipeTransform {
  transform(text: string): any[] {
    return unescape(text);
  }
}