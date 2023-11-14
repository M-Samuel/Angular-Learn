import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../types/product';
import { EventSourcing, LastStateEvent } from '../Helpers/EventSourcing';
import { OperatorFunction, filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-creation',
  templateUrl: './product-creation.component.html',
  styleUrls: ['./product-creation.component.scss']
})
export class ProductCreationComponent implements OnDestroy{

  hasSubmitted = false;

  private readonly _eventSourcing:EventSourcing<State,Event> = new EventSourcing<State,Event>()
  private readonly _eventStream$ = this._eventSourcing.lastStateEvent$
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)

  readonly createProductFG = this._formBuilder.group({
    name: new FormControl<string|null>(null,{validators: [Validators.required, Validators.maxLength(20)], updateOn: 'submit'}),
    image: new FormControl<string|null>(null,{validators: [Validators.required, simpleUrlValidator], updateOn: 'submit'})
  })

  readonly createdProduct$ = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'CreateNewProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.newProduct),
    map(lastStateEvent => lastStateEvent.newState.newProduct) as OperatorFunction<LastStateEvent<State,Event>,Product>,
    switchMap(product => this._productService.createProduct$(product))
  )

  private emitEventCreateNewProduct(newProduct: Product){
    console.log(newProduct, `emitEventCreateNewProduct`)
    this._eventSourcing.emit((oldState) => {
      const newState:State = {...oldState, newProduct: newProduct}
      return {newState: newState, event: 'CreateNewProduct'} 
    })
  }

  ngOnDestroy(): void {
    this._eventSourcing.Destroy()
  }


  onSubmit(){
    this.hasSubmitted = true
    if(this.createProductFG.valid){
      const product: Product = {} as Product
      Object.assign(product, this.createProductFG.value)
      console.log(product)
      this.emitEventCreateNewProduct(product)
    }
    else{
      console.log(this.createProductFG)
    }
  }

  get nameControl(){
    return this.createProductFG.controls['name']
  }

  get imageControl(){
    return this.createProductFG.controls['image']
  }
}


export function simpleUrlValidator(control:AbstractControl): ValidationErrors | null{
  const value:string = control.value
  if(!value) return null

  const validationError: ValidationErrors | null= !value.includes('http') ? {invalidUrlFormat:true} : null

  return validationError
}

type Event = 
  'CreateNewProduct'


interface State{
  newProduct?: Product
}