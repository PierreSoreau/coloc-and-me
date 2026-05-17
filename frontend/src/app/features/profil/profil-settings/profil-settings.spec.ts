import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilSettings } from './profil-settings';

describe('ProfilSettings', () => {
  let component: ProfilSettings;
  let fixture: ComponentFixture<ProfilSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
