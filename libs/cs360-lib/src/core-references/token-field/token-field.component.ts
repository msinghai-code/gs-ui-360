import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, ViewChild, forwardRef, AfterContentInit
} from '@angular/core';
import {debounceTime, takeUntil} from "rxjs/internal/operators";
import {filter} from "rxjs/operators";
import {ESCAPE} from "@angular/cdk/keycodes";
import {DomSanitizer} from "@angular/platform-browser";
import * as $_ from "jquery";

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const TOKEN_INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TokenFieldComponent),
  multi: true
};
const j$ = $_;

@Component({
  selector: 'gs-token-field',
  templateUrl: './token-field.component.html',
  styleUrls: ['./token-field.component.scss'],
  providers: [TOKEN_INPUT_VALUE_ACCESSOR]
})
export class TokenFieldComponent implements OnInit, AfterContentInit, OnDestroy, ControlValueAccessor {

  @Input()
  showFields:Array<{
    label:string;
    fieldName:string;
    [key:string]:any;
  }> = [];

  @Input()
    commentText = null;

  tokenFields: Array<{
    label:string;
    fieldName:string;
    [key:string]:any;
  }> = [];

  innerHTML = "";

  get value(){
    return this.innerHTML;
  }

  @ViewChild('ce', { static: true })
  contentEditableDivEle: ElementRef;

  editEvents: EventEmitter<any> = new EventEmitter();
  unBinder: EventEmitter<any> = new EventEmitter();
  showTags = false;
  queryWord: string;

  public disabled = false;
  private propagateFn;
  private touchedFn;

  constructor(private _sanitizer: DomSanitizer) { }

  writeValue(obj: any): void {
    this.innerHTML = obj;
  }

  registerOnChange(fn: any): void {
    this.propagateFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {
    this.tokenFields = [...this.showFields];
    this.editEvents
      .pipe(
        debounceTime(300),
        takeUntil(this.unBinder.pipe(filter(val => val === "DESTROY")))
      )
      .subscribe(({target, keyCode, value}) => {

        if(keyCode === ESCAPE) {
          this.showTags = false;
          return;
        }

        const $element = this.getRangeElement(target);
        const caret = this.getCaretCharacterOffsetWithin($element);
        const before = j$($element).text().substr(0, caret);
        const lastWordStartIndex = before.lastIndexOf("@");
        const currentWord = before.substr(lastWordStartIndex);
        const regex = new RegExp(/^@(.*)/i);
        const queryWord = regex.exec(currentWord);

        if(queryWord && queryWord.length > 1) {
          this.tokenFields = this.showFields.filter((showField) => {
            return showField.label.toLowerCase().search(queryWord[1].toLowerCase()) > -1;
          });
          this.showTags = true;
          this.queryWord = queryWord[0];
        } else {
          this.showTags = false;
        }

        if (value !== this.innerHTML) {
          if (this.propagateFn) {
            this.propagateFn(value);
          }
        }

      });
  }
  ngAfterContentInit() {
    this.renderComments();
  }
  renderComments() {
    if(this.commentText){
      const tokens = this.getTokens(this.commentText);
      tokens.map(token => {
        const _token = token.replace("${", "").replace("}", "");
        const isShowFieldExistsForToken = this.showFields
          .find((showField: any) => {
            return showField.fieldName === _token;
        })
        if(!isShowFieldExistsForToken){
          const unResolvedTokenField = "${<span style='color: red' title='Invalid token'>" + _token + "</span>}";
          this.commentText = this.commentText.replace(token, unResolvedTokenField);
          console.error('Unable to resolve the '+ token);
        }
      });
      this.innerHTML = this.commentText;
    }
  }
  getRangeElement (editableDiv) {
    let range, rangeElement;
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        rangeElement = range.commonAncestorContainer.parentNode;
      }
    }
    return rangeElement;
  }

  getCaretCharacterOffsetWithin(element) {
    let caretOffset = 0;
    if (window.getSelection) {
      const range = window.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  onTokenSelect(evt, ce: HTMLElement, selectedObj) {
    // TODO: To change to be configrable on what attribute to show as label or pass it on
    const label = selectedObj.fieldName || selectedObj.label;
    const token = "${" + label + "}";
    const index = ce.innerHTML.indexOf(this.queryWord);
    const commentTxt = ce.innerHTML.replace(this.queryWord, token);
    this.showTags = false;
    this.innerHTML = commentTxt;

    const offset = index + token.length;

    if(this.propagateFn) {
      this.propagateFn(commentTxt);
    }

    setTimeout(() => this.placeCaretAtPosition(ce, offset));
  }
  placeCaretAtPosition(contentEditableEle, offset) {
    let range,selection;
    if(document.createRange) {
      range = document.createRange();// Create a range (selection but invisible)
      range.selectNodeContents(contentEditableEle);// Select the entire contents of the element with the range
      range.setStart(contentEditableEle.childNodes[0], offset);
      range.collapse(true);// collapse the range to the end point. false means collapse to end rather than the start
      selection = window.getSelection();// get the selection object (allows you to change selection)
      selection.removeAllRanges();// remove any selections already made
      selection.addRange(range);// make the range you have just created the visible selection
    }
  }

  getTokens(commentText?) {
    const commentTxt: any = commentText ? commentText: this.contentEditableDivEle.nativeElement.innerHTML;
    const tokens:any = (commentTxt && commentTxt.match(/\${(.*?)}/g)) ? commentTxt.match(/\${(.*?)}/g) : [];
    return tokens;
  }

  isTokenBased() {
    const tokens = this.getTokens();
    return (tokens.length > 0);
  }

  ngOnDestroy() {
    this.unBinder.emit('DESTROY');
  }

}
