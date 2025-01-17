import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenFieldComponent } from './token-field.component';

describe('TokenFieldComponent', () => {
  let component: TokenFieldComponent;
  let fixture: ComponentFixture<TokenFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
