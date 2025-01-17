import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsatWidgetComponent } from './csat-widget.component';

describe('CsatWidgetComponent', () => {
  let component: CsatWidgetComponent;
  let fixture: ComponentFixture<CsatWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsatWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsatWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
