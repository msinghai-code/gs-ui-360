import {Observable, of, empty} from "rxjs";

import {delay, map, merge, takeUntil} from "rxjs/operators";
import {ComponentFactory, EventEmitter, Injectable, TemplateRef} from "@angular/core";

import { MatDialog } from "@angular/material/dialog";

import {AlertComponent} from "./alert.component";
import {PromptComponent} from "./prompt.component";
import {ConfirmComponent} from "./confirm.component";
import {DialogHostComponent} from "./dialog-host.component";

export enum MatButtonColors{
  primary = "primary",
  secondary = "secondary"
}

export enum MatButtonClasses{
  mat_raised_button = "mat-raised-button",
  mat_stroked_button = "mat-stroked-button",
  mat_flat_button = "mat-flat-button"
}

type valueFn = (...args)=>void;
export interface IDialogAction {
    label: string;
    disabled?: boolean;
    value?: string | valueFn;
    class?: string;
    color?: string;
    buttons?: Array<string>;
}

export interface IDialogNotification {
    type: string;
    action?: string;
    data?: any;
}

export interface IDialogOptions {
    title: string;
    disableClose?: boolean;
    componentData?: any;
    panelClass?: string;
    buttons?: Array<string>;
}

export interface IDialog {
    notifier?: EventEmitter<any>;
    actions?: IDialogAction[];
    updateData?: (data: any) => void;
    // Return true to close the dailog else return false to keep it open
    execute: (action: IDialogAction, ...args) => Observable<any> | Promise<any> | boolean;
}

@Injectable()
export class DialogManagementService {

    private _colors = [MatButtonColors.primary, MatButtonColors.primary, MatButtonColors.secondary];
    private _buttons = [MatButtonClasses.mat_raised_button, MatButtonClasses.mat_stroked_button, MatButtonClasses.mat_flat_button];
    constructor(private _dialog: MatDialog) { }

    alert(message: string, title = "Alert") {
        const dialogRef = this._dialog.open(AlertComponent, {
            data: { message, title, colors: this._colors },
            disableClose: true
        });
        dialogRef
            .afterClosed()
            .subscribe(result => { }, console.error, () => console.info("alert unsubscribed"));
    }

    // TODO: find all options for all dialogs, check the font casing..
    confirm(message: string, options = ["No", "Yes"], title = "Confirm"): Observable<any> {
        const dialogRef = this._dialog.open(ConfirmComponent, {
            data: { message, title, options, colors: this._colors, buttons: this._buttons  },
            disableClose: true
        });
        return dialogRef
            .afterClosed();
    }

    prompt(title = "Enter value"): Observable<any> {
        const dialogRef = this._dialog.open(PromptComponent, {
            data: { title, colors: this._colors, buttons: this._buttons },
            disableClose: true
        });
        return dialogRef
            .afterClosed();
    }

    open<T extends IDialog>(component: ComponentFactory<T> | TemplateRef<T>, options: IDialogOptions): Observable<IDialogNotification> {

        options = options || { title: "Dialog", disableClose: false, componentData: null };

        if (component instanceof ComponentFactory) {

            const dialogRef = this._dialog.open<DialogHostComponent<T>>(DialogHostComponent, {
                data: { colors: this._colors, buttons: this._buttons, ...options },
                disableClose: options.disableClose,
                panelClass: options.panelClass,
            });
            const updates = dialogRef.componentInstance.create(component);
            const close = dialogRef.afterClosed().pipe(map(action => ({ action, type: "CLOSE" })));

            // NOTE: as I obseved here, delay(5) is not required,
            // but adding to make sure that last update is emitted from the component popped..
            return empty()
              .pipe(
                takeUntil(close.pipe(delay(5))),
                merge(updates),
                merge(close)
              );
        } else {

            const dialogRef = this._dialog.open<T>(component, {
                data: { colors: this._colors, ...options },
                disableClose: options.disableClose
            });

            const close = dialogRef.afterClosed().pipe(map(action => ({ action, type: "CLOSE" })));
            return close;

        }
    }
}
