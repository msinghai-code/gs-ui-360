import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmAttributeComponent } from './csm-attribute.component';

describe('CsmAttributeComponent', () => {
  let component: CsmAttributeComponent;
  let fixture: ComponentFixture<CsmAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
