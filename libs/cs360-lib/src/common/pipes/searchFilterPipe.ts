import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {
    transform(items, prop: string, searchTerm: string) {
        if(searchTerm) {
            return items.filter(section => section[section[prop] ? prop : 'originalLabel'].toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return items;
    }
}