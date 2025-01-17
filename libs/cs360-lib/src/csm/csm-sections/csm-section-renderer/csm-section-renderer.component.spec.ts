import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmSectionRendererComponent } from './csm-section-renderer.component';

describe('CsmSectionRendererComponent', () => {
  let component: CsmSectionRendererComponent;
  let fixture: ComponentFixture<CsmSectionRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmSectionRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmSectionRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
