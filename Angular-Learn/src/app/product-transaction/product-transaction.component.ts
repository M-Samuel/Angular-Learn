import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Observable, OperatorFunction, filter, map, of, switchMap, tap } from 'rxjs';
import { Product } from '../types/product';
import { EventSourcing, LastStateEvent } from '../Helpers/EventSourcing';
import { ProductTransaction } from '../types/product-transaction';
import { ProductInventory } from '../types/product-inventory';
import { ProductBuyOrder } from '../types/product-buy-order';
import { ProductSellOrder } from '../types/product-sell-order';

@Component({
  selector: 'app-product-transaction',
  templateUrl: './product-transaction.component.html',
  styleUrls: ['./product-transaction.component.scss']
})
export class ProductTransactionComponent implements OnInit, OnDestroy{
  
  hasSubmitted = false;
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)
  private readonly _eventSourcing:EventSourcing<State,Event> = new EventSourcing<State,Event>()
  private readonly _eventStream$ = this._eventSourcing.lastStateEvent$
  
  readonly transactProductFG = this._formBuilder.group({
    productId: new FormControl<number|null>(null,{validators: [Validators.required], updateOn: 'submit'}),
    price: new FormControl<number|null>(null,{validators: [Validators.required, Validators.min(1), Validators.max(1000)], updateOn: 'submit'}),
    quantity: new FormControl<number|null>(null,{validators: [Validators.required, Validators.min(1), Validators.max(100)], updateOn: 'submit'}),
    buysell: new FormControl<string|null>(null,{validators: [Validators.required], updateOn: 'submit'}),
  }, {asyncValidators: this.inventoryQuantityControl.bind(this)})

  
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._eventSourcing.Destroy()
  }

  readonly allProducts$: Observable<Product[]> = this._productService.getAllProducts$()

  readonly transactionsPerProduct$: Observable<ProductTransaction[]> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'ProductChanged' || lastStateEvent.event === 'TransactionCreated'),
    filter(lastStateEvent => !!lastStateEvent.newState.productId),
    map(lastStateEvent => lastStateEvent.newState.productId) as OperatorFunction<LastStateEvent<State,Event>,number>,
    switchMap(productId => this._productService.getAllTransactionPerProduct$(productId))
  )

  readonly selectedProduct$: Observable<Product> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'ProductChanged'),
    filter(lastStateEvent => !!lastStateEvent.newState.productId),
    map(lastStateEvent => lastStateEvent.newState.productId) as OperatorFunction<LastStateEvent<State,Event>,number>,
    switchMap(productId => this._productService.getProductById$(productId))
  )

  readonly selectedProductInventory$: Observable<ProductInventory> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'ProductChanged' || lastStateEvent.event === 'TransactionCreated'),
    filter(lastStateEvent => !!lastStateEvent.newState.productId),
    map(lastStateEvent => lastStateEvent.newState.productId) as OperatorFunction<LastStateEvent<State,Event>,number>,
    switchMap(productId => this._productService.getInventoryPerProduct$(productId))
  )


  readonly createdTransaction$: Observable<ProductTransaction> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'TransactionSubmitted'),
    filter(lastStateEvent => !!lastStateEvent.newState.productTransaction),
    map(lastStateEvent => lastStateEvent.newState.productTransaction) as OperatorFunction<LastStateEvent<State,Event>,ProductTransaction>,
    switchMap(productTransaction => this._productService.createTransaction$(productTransaction)),
    tap(createdTransaction => this.emitEventTransactionCreated(createdTransaction))
  )





  private emitEventProductChanged(productId: number){
    console.log(productId, 'emitEventProductChanged');
    this._eventSourcing.emit((oldState) => {
      const newState = {...oldState, productId: productId}
      return {newState: newState, event: 'ProductChanged'}
    })
  }

  private emitEventTransactionSubmitted(productTransaction: ProductTransaction){
    console.log(productTransaction, 'emitEventTransactionSubmitted');
    this._eventSourcing.emit((oldState) => {
      const newState = {...oldState, productTransaction: productTransaction}
      return {newState: newState, event: 'TransactionSubmitted'}
    })
  }

  private emitEventTransactionCreated(productTransaction: ProductTransaction){
    console.log(productTransaction, 'emitEventTransactionCreated');
    this._eventSourcing.emit((oldState) => {
      const newState = {...oldState, productTransaction:productTransaction}
      return {newState: newState, event: 'TransactionCreated'}
    })
  }

  

  onSubmit(){
    console.log(this.transactProductFG)
    this.hasSubmitted = true
    if(this.transactProductFG.valid){
      const productTransaction:ProductTransaction = this.convertToProductTransaction(this.transactProductFG.value)
      this.emitEventTransactionSubmitted(productTransaction)
      this.transactProductFG.reset()
      this.hasSubmitted = false
    }
    else{
      console.log(this.transactProductFG)
    }
  }


  private convertToProductTransaction(value: Partial<{ productId: number | null; price: number | null; quantity: number | null; buysell: string | null; }>): ProductTransaction {
    const pid: number = parseInt(value.productId+"")
    if(value.buysell === "buy"){
      const buyOrder = {
        price: value.price,
        productId: pid,
        quantity: value.quantity
      } as ProductBuyOrder
      
      const productTransaction: ProductTransaction = {
          buyOrder: buyOrder
      }
      return productTransaction
    }
    else{
      const sellOrder = {
        price: value.price,
        productId: pid,
        quantity: value.quantity
      } as ProductSellOrder
      
      const productTransaction: ProductTransaction = {
          sellOrder: sellOrder
      }
      return productTransaction
    }
    
  }

  onOptionsSelected(event:any){
    const value = event.target.value;
    const productId = parseInt(value ?? "-1")
    this.emitEventProductChanged(productId)
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
    
  
    return this._productService.getAllInventories$().pipe(
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

type Event = 'ProductChanged' |
'TransactionSubmitted' |
'TransactionCreated'


interface State{
  productId?: number,
  productTransaction?: ProductTransaction
}
