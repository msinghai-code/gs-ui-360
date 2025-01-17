import {ITooltipAngularComp} from "@ag-grid-community/angular";
import {ITooltipParams} from "@ag-grid-community/core";
import {Component} from "@angular/core";

@Component({
    template: `
        <div class="custom-tooltip" fxLayout="column" [style.background-color]="'#000'" [ngStyle]="{ 'border-radius': '6px' }">
            <p [innerHTML]="params.value"></p>
        </div>`
    ,
    styles: [
        `
            :host {
                max-width: 240px;
                pointer-events: none;
                transition: opacity 0.2s;
                position: absolute;
                word-wrap: break-word;
            }

            :host.ag-tooltip-hiding {
                opacity: 0;
            }
            
            .custom-tooltip p {
                pointer-events: none;
                color: #fff;
                padding: 8px;
            }
        `,
    ],
})
export class CustomTooltip implements ITooltipAngularComp {
    params!: ITooltipParams;

    agInit(params: { color: string } & ITooltipParams): void {
        this.params = params;
        console.log('params', this.params);
    }
}
