import {Component, ElementRef, Inject, ViewChild} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ENTER, ESCAPE} from "@angular/cdk/keycodes";

@Component({
    template: `
    <mat-card class="gs-dialog gs-prompt" (keyup)="onKeyup($event)">
        <mat-card-content>
        {{data.title}}
          <div>
              <mat-form-field>
                  <input #pInput matInput placeholder="">
              </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
            <!-- to identify cancel action from "cancel" value-->
            <button mat-button [mat-dialog-close]="{type: 'CANCELLED'}" [color]="data.colors[1]" class="mat-stroked-button">Cancel</button>
            <button mat-button [mat-dialog-close]="pInput.value" [color]="data.colors[0]" class="mat-raised-button">Ok</button>
        </mat-card-actions>
    </mat-card>
    `,
  styleUrls: ["./dialog.component.scss"]
})
export class PromptComponent {
    @ViewChild("pInput", {static: false})
    pInput: ElementRef;
    constructor( @Inject(MAT_DIALOG_DATA) public data: any, private _dialogRef: MatDialogRef<PromptComponent>) { }
    onKeyup(evt: KeyboardEvent) {
        if (evt.keyCode === ENTER) {
            this._dialogRef.close(this.pInput.nativeElement.value);
        } else if (evt.keyCode === ESCAPE) {
            this._dialogRef.close({type: "ESCAPE"});
        }
    }
}
