import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMenuComponent } from './create-menu.component';

describe('CreateMenuComponent', () => {
  let component: CreateMenuComponent;
  let fixture: ComponentFixture<CreateMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
