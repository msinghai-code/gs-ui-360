import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeFieldEditorComponent } from './attribute-field-editor.component';

describe('AttributeFieldEditorComponent', () => {
  let component: AttributeFieldEditorComponent;
  let fixture: ComponentFixture<AttributeFieldEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeFieldEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeFieldEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
