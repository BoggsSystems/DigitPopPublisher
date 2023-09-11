import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEditComponent } from './asset-edit.component';

describe('AssetEditComponent', () => {
  let component: AssetEditComponent;
  let fixture: ComponentFixture<AssetEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetEditComponent]
    });
    fixture = TestBed.createComponent(AssetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
