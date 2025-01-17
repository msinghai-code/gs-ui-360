import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthScoreRendererComponent } from './health-score-renderer.component';

describe('HealthScoreRendererComponent', () => {
  let component: HealthScoreRendererComponent;
  let fixture: ComponentFixture<HealthScoreRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthScoreRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthScoreRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
