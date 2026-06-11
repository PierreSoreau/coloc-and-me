import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteDepense } from './write-depense';

describe('WriteDepense', () => {
  let component: WriteDepense;
  let fixture: ComponentFixture<WriteDepense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteDepense],
    }).compileComponents();

    fixture = TestBed.createComponent(WriteDepense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
