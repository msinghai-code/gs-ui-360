import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'surveyFilter' })
export class SurveyFilter implements PipeTransform {
  // /**
  //  * Transform
  //  *
  //  * @param {any[]} items
  //  * @param {string} searchText
  //  * @returns {any[]}
  //  */
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = (searchText.toLocaleLowerCase() as any).replaceAll(" ", "");

    return items.filter(it => {
      return it.name.replaceAll(" ", "").toLocaleLowerCase().includes(searchText);
    });
  }
}