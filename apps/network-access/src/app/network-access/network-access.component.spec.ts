import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkAccessComponent } from './network-access.component';

describe('NetworkAccessComponent', () => {
  let component: NetworkAccessComponent;
  let fixture: ComponentFixture<NetworkAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
