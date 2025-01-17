import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NzI18nService } from "@gs/ng-horizon/i18n";


@Component({
    selector: 'gs-layout-not-found',
    templateUrl: './layout-not-found.component.html',
    styleUrls: ['./layout-not-found.component.scss']
})
export class LayoutNotFoundComponent implements OnInit {
    // {360.admin.layout_not_found.no_layout}='Layout not found'
    //{360.admin.layout_not_found.no_layout_description}='The layout id is wrong or this layout has been deleted.'
    title = this.i18nService.translate('360.admin.layout_not_found.no_layout');
    description = this.i18nService.translate('360.admin.layout_not_found.no_layout_description');

    constructor(private route: ActivatedRoute,private i18nService: NzI18nService) {}
    ngOnInit() {
        this.route.data.subscribe(data => {
            if(data.layoutOrSection) {
                // {360.admin.layout_not_found.no_layout_title}='Layout/Section not found'
                // {360.admin.layout_not_found.no_layout_message}='The layout/section id is wrong or this layout/section has been deleted.'
                this.title = this.i18nService.translate('360.admin.layout_not_found.no_layout_title');
                this.description = this.i18nService.translate('360.admin.layout_not_found.no_layout_message');
            }
        })
    }

}