import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularHelpsComponent } from './angular-helps.component';

describe('AngularHelpsComponent', () => {
  let component: AngularHelpsComponent;
  let fixture: ComponentFixture<AngularHelpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngularHelpsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularHelpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
