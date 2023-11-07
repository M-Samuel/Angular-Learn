import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { Observable } from 'rxjs';
import { Product } from '../types/product';
import { ProductTransactionService } from './product-transaction.service';

@Component({
  selector: 'app-product-transaction',
  templateUrl: './product-transaction.component.html',
  styleUrls: ['./product-transaction.component.scss']
})
export class ProductTransactionComponent implements OnInit{
  hasSubmitted = false;
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)
  private readonly _productTransactionService = inject(ProductTransactionService)
  
  readonly transactProductFG = this._formBuilder.group({
    productId: new FormControl<number|null>(null,{validators: [Validators.required], updateOn: 'submit'}),
    price: new FormControl<number|null>(null,{validators: [Validators.required, Validators.min(1), Validators.max(1000)], updateOn: 'submit'}),
    quantity: new FormControl<number|null>(null,{validators: [Validators.required, Validators.min(1), Validators.max(100)], updateOn: 'submit'}),
    buysell: new FormControl<string|null>(null,{validators: [Validators.required], updateOn: 'submit'}),
  })
  
  ngOnInit(): void {
    this._productService.emitEventRequestAllProducts()
  }
  readonly allProducts$: Observable<Product[]> = this._productService.products$
  readonly transactionsPerProduct$ = this._productTransactionService.transactionsPerProduct$

  onSubmit(){
    console.log(this.transactProductFG)
  }

  onOptionsSelected(event:any){
    const value = event.target.value;
    const productId = parseInt(value ?? "-1")
    this._productTransactionService.emitEventRequestTransactionsPerProduct(productId)
  }
}
