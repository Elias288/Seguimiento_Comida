import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMenuDialogComponent } from './create-menu-dialog.component';

describe('CreateMenuDialogComponent', () => {
  let component: CreateMenuDialogComponent;
  let fixture: ComponentFixture<CreateMenuDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMenuDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMenuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
