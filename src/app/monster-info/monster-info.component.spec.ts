import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonsterInfoComponent } from './monster-info.component';

describe('MonsterInfoComponent', () => {
  let component: MonsterInfoComponent;
  let fixture: ComponentFixture<MonsterInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonsterInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonsterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
