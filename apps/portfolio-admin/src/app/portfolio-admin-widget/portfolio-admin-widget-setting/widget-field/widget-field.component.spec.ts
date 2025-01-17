import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetFieldComponent } from './widget-field.component';

describe('WidgetFieldComponent', () => {
  let component: WidgetFieldComponent;
  let fixture: ComponentFixture<WidgetFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
