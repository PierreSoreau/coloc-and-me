import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAuth } from './header-auth';

describe('HeaderAuth', () => {
  let component: HeaderAuth;
  let fixture: ComponentFixture<HeaderAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAuth],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderAuth);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
