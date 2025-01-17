import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureDisabledComponent } from './feature-disabled.component';

describe('FeatureDisabledComponent', () => {
  let component: FeatureDisabledComponent;
  let fixture: ComponentFixture<FeatureDisabledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureDisabledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureDisabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
