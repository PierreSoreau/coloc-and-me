import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Remboursement } from './remboursement';

describe('Remboursement', () => {
  let component: Remboursement;
  let fixture: ComponentFixture<Remboursement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Remboursement],
    }).compileComponents();

    fixture = TestBed.createComponent(Remboursement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
