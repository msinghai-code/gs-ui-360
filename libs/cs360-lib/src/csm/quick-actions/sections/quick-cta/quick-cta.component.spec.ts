import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCtaComponent } from './quick-cta.component';

describe('QuickCtaComponent', () => {
  let component: QuickCtaComponent;
  let fixture: ComponentFixture<QuickCtaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickCtaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
