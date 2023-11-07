import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTransactionComponent } from './product-transaction.component';

describe('ProductTransactionComponent', () => {
  let component: ProductTransactionComponent;
  let fixture: ComponentFixture<ProductTransactionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductTransactionComponent]
    });
    fixture = TestBed.createComponent(ProductTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
