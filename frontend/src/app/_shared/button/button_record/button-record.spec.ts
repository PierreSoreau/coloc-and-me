import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonRecord } from './button-record';

describe('ButtonRecord', () => {
  let component: ButtonRecord;
  let fixture: ComponentFixture<ButtonRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
