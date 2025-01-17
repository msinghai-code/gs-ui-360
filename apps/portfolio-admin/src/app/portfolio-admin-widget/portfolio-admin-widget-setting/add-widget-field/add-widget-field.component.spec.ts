import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWidgetFieldComponent } from './add-widget-field.component';

describe('AddWidgetFieldComponent', () => {
  let component: AddWidgetFieldComponent;
  let fixture: ComponentFixture<AddWidgetFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWidgetFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWidgetFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
