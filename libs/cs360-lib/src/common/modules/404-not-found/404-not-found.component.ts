import { Component, Input } from "@angular/core";


@Component({
    selector: 'gs-404-not-found',
    templateUrl: './404-not-found.component.html',
    styleUrls: ['./404-not-found.component.scss']
})
export class Gs404NotFoundComponent {

    @Input() title = '';
    @Input() description = '';
}