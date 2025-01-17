import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSectionRendererComponent } from './admin-section-renderer.component';

describe('AdminSectionRendererComponent', () => {
  let component: AdminSectionRendererComponent;
  let fixture: ComponentFixture<AdminSectionRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSectionRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSectionRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
