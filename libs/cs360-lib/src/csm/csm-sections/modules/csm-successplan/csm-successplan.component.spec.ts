import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmSuccessplanComponent } from './csm-successplan.component';

describe('CsmSuccessplanComponent', () => {
  let component: CsmSuccessplanComponent;
  let fixture: ComponentFixture<CsmSuccessplanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmSuccessplanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmSuccessplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
