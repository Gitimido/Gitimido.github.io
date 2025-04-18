import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BootupComponent } from './bootup.component';

describe('BootupComponent', () => {
  let component: BootupComponent;
  let fixture: ComponentFixture<BootupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BootupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BootupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
