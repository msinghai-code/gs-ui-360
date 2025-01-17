import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpsWidgetComponent } from './nps-widget.component';

describe('NpsWidgetComponent', () => {
  let component: NpsWidgetComponent;
  let fixture: ComponentFixture<NpsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
