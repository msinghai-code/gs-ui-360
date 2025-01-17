import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickEnhancementRequestComponent } from './quick-enhancement-request.component';

describe('QuickEnhancementRequestComponent', () => {
  let component: QuickEnhancementRequestComponent;
  let fixture: ComponentFixture<QuickEnhancementRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEnhancementRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEnhancementRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
