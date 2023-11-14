import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../types/product';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { simpleUrlValidator } from '../product-creation/product-creation.component';
import { Observable, OperatorFunction, Subscription, filter, map, switchMap } from 'rxjs';
import { EventSourcing, LastStateEvent } from '../Helpers/EventSourcing';

@Component({
  selector: 'app-product-editing',
  templateUrl: './product-editing.component.html',
  styleUrls: ['./product-editing.component.scss']
})
export class ProductEditingComponent implements OnInit, OnDestroy{
  private readonly activateRoute: ActivatedRoute = inject(ActivatedRoute)
  private readonly _eventSourcing:EventSourcing<State,Event> = new EventSourcing<State,Event>()
  private readonly _eventStream$ = this._eventSourcing.lastStateEvent$
  product!: Product
  hasSubmitted: boolean = false
  editedProductSubscription: Subscription;
  deletedProductSubscription: Subscription;

  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)
  private readonly _router = inject(Router)

  readonly editProductFG = this._formBuilder.group({
    name: new FormControl<string|null>(null,{validators: [Validators.required, Validators.maxLength(20)], updateOn: 'submit'}),
    image: new FormControl<string|null>(null,{validators: [Validators.required, simpleUrlValidator], updateOn: 'submit'})
  })

  readonly editedProduct$: Observable<Product> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'EditProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.editedProduct),
    map(lastStateEvent => lastStateEvent.newState.editedProduct) as OperatorFunction<LastStateEvent<State,Event>, Product>,
    switchMap(product => this._productService.editProduct$(product))
  )

  readonly deletedProduct$: Observable<Product> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'DeleteProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.deletedProduct),
    map(lastStateEvent => lastStateEvent.newState.deletedProduct) as OperatorFunction<LastStateEvent<State,Event>, Product>,
    switchMap(product => this._productService.deleteProduct$(product))
  )
  
  constructor(){
    this.editedProductSubscription = this.editedProduct$.subscribe(
      editedProduct => this.product = editedProduct
    )
    this.deletedProductSubscription = this.deletedProduct$.subscribe(
      deleteProduct => this._router.navigate(['/product/all'])
    )
  }
  ngOnDestroy(): void {
    this.editedProductSubscription.unsubscribe()
    this.deletedProductSubscription.unsubscribe()
    this._eventSourcing.Destroy()
  }

  ngOnInit(): void {
    this.product = this.activateRoute.snapshot.data['product']
    this.nameControl.setValue(this.product.name)
    this.imageControl.setValue(this.product.image)
  }

  emitEventEditProduct(editedProduct: Product){
    console.log(editedProduct, `emitEventEditProduct`)
    this._eventSourcing.emit((oldState) => {
      const newState:State = {...oldState, editedProduct: editedProduct}
      return {newState: newState, event: 'EditProduct'} 
    })
  }

  emitEventDeleteProduct(deletedProduct: Product){
    console.log(deletedProduct, `emitEventDeleteProduct`)
    this._eventSourcing.emit((oldState) => {
      const newState:State = {...oldState, deletedProduct: deletedProduct}
      return {newState: newState, event: 'DeleteProduct'} 
    })
  }

  onSubmit(){
    this.hasSubmitted = true
    if(this.editProductFG.valid){
      const product: Product = {...this.product} as Product
      Object.assign(product, this.editProductFG.value)
      console.log(product)
      this.emitEventEditProduct(product)
    }
    else{
      console.log(this.editProductFG)
    }
  }

  get nameControl(){
    return this.editProductFG.controls['name']
  }

  get imageControl(){
    return this.editProductFG.controls['image']
  }


  onDelete(){
    this.emitEventDeleteProduct(this.product)
  }
}

type Event = 
  'EditProduct'|
  'DeleteProduct'


interface State{
  editedProduct?: Product
  deletedProduct?: Product
}