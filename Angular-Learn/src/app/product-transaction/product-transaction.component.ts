import { Component, Injectable, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { Observable, Subscription, delay, map, of, take } from 'rxjs';
import { Product } from '../types/product';
import { ProductTransactionService } from './product-transaction.service';
import { ProductInventoryService } from '../product-inventory/product-inventory.service';
import { ProductInventory } from '../types/product-inventory';

@Component({
  selector: 'app-product-transaction',
  templateUrl: './product-transaction.component.html',
  styleUrls: ['./product-transaction.component.scss']
})
export class ProductTransactionComponent implements OnInit, OnDestroy{
  
  hasSubmitted = false;
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)
  private readonly _productTransactionService = inject(ProductTransactionService)
  private readonly _productInventoryService = inject(ProductInventoryService)
  
  readonly transactProductFG = this._formBuilder.group({
    productId: new FormControl<number|null>(null,{validators: [Validators.required], updateOn: 'submit'}),
    price: new FormControl<number|null>(null,{validators: [Validators.required, Validators.min(1), Validators.max(1000)], updateOn: 'submit'}),
    quantity: new FormControl<number|null>(null,{validators: [Validators.required, Validators.min(1), Validators.max(100)], updateOn: 'submit'}),
    buysell: new FormControl<string|null>(null,{validators: [Validators.required], updateOn: 'submit'}),
  }, {asyncValidators: this.inventoryQuantityControl.bind(this)})
  inventory: ProductInventory[] = [];
  invSubscription!: Subscription;
  
  ngOnInit(): void {
    this._productService.emitEventRequestAllProducts()

    this._productInventoryService.emitEventRequestAllInventory()
    
    this.invSubscription = this._productInventoryService.productInventories$.subscribe(
      inventory => this.inventory = inventory
    )
  }

  ngOnDestroy(): void {
    this.invSubscription.unsubscribe()
  }

  readonly allProducts$: Observable<Product[]> = this._productService.products$
  readonly transactionsPerProduct$ = this._productTransactionService.transactionsPerProduct$

  onSubmit(){
    console.log(this.transactProductFG)
    this.hasSubmitted = true
  }

  onOptionsSelected(event:any){
    const value = event.target.value;
    const productId = parseInt(value ?? "-1")
    this._productTransactionService.emitEventRequestTransactionsPerProduct(productId)
  }

  inventoryQuantityControl(control: AbstractControl): Observable<ValidationErrors | null> {
    const quantity:number = control.get('quantity')?.value
    const productId:number = parseInt(control.get('productId')?.value ?? -1)
    const buysell:string = control.get('buysell')?.value
  
    console.log(quantity)
    console.log(productId)
    console.log(buysell)
    if(buysell === "buy")
      return of(null)
    
    this._productInventoryService.emitEventRequestAllInventory()
  
    return this._productInventoryService.productInventories$.pipe(
      take(1),
      map(inventories => inventories.find(inv => inv.productId === productId)),
      map(productInventory => {
        if(!productInventory)
          return {InventoryStockNotFound:true}
        if(productInventory.quantity < quantity)
          return {InventoryStockExceeded:true, InventoryStock:productInventory.quantity, SellQuantity:quantity}
        return null
      })
    )
  }

  get productIdControlErrors(){
    return this.transactProductFG.controls.productId.errors
  }

  get quantityControlErrors(){
    return this.transactProductFG.controls.quantity.errors
  }

  get priceControlErrors(){
    return this.transactProductFG.controls.price.errors
  }

  get buysellControlErrors(){
    return this.transactProductFG.controls.buysell.errors
  }

  get generalControlErrors(){
    return this.transactProductFG.errors
  }

}
