import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, OperatorFunction, Subject, delay, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { Product } from '../types/product';
import { DataStoreService } from '../DataStore/data-store.service';

@Injectable({
  providedIn: 'root'
})


export class ProductService {

  private readonly _httpClient: DataStoreService = inject(DataStoreService)

  
  private readonly _state: State = {} as State  

  private readonly _stateEventHandlerSubject$ = new Subject<UpdateStateHandler>()
  private readonly _lastStateEvent$: Observable<LastStateEvent> = this._stateEventHandlerSubject$.asObservable().pipe(
    shareReplay(1, 500),
    map(updateStateHandler => updateStateHandler(this._state)),
    tap(lastStateEvent => Object.assign(this._state, lastStateEvent.newState))
  )

  constructor(){
    this._lastStateEvent$.subscribe(lastStateEvent => console.log(lastStateEvent))
  }

  emitEventCreateNewProduct(newProduct: Product){
    console.log(newProduct, `emitEventCreateNewProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState:State = {...oldState, newProduct: newProduct}
      return {newState: newState, event: 'CreateNewProduct'} 
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventRequestSingleProduct(productId: number){
    console.log(productId, `emitEventRequestSingleProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState:State = {...oldState, productId: productId}
      return {newState: newState, event: 'RequestSingleProduct'} 
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventEditProduct(editedProduct: Product){
    console.log(editedProduct, `emitEventEditProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState:State = {...oldState, editedProduct: editedProduct}
      return {newState: newState, event: 'EditProduct'} 
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventDeleteProduct(deletedProduct: Product){
    console.log(deletedProduct, `emitEventDeleteProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState:State = {...oldState, deletedProduct: deletedProduct}
      return {newState: newState, event: 'DeleteProduct'} 
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventRequestAllProducts(){
    console.log(undefined, `emitEventRequestAllProducts`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState:State = {...oldState}
      return {newState: newState, event: 'RequestAllProducts'} 
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }


  readonly products$: Observable<Product[]> = this._lastStateEvent$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'RequestAllProducts'),
    switchMap(lastStateEvent => this._httpClient.httpGetAllProducts())
  )

  readonly createdProduct$ = this._lastStateEvent$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'CreateNewProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState?.newProduct),
    map(lastStateEvent => lastStateEvent.newState?.newProduct) as OperatorFunction<LastStateEvent,Product>,
    switchMap(product => this._httpClient.httpPostProduct(product))
  )

  readonly productById$: Observable<Product> = this._lastStateEvent$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'RequestSingleProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.productId),
    map(lastStateEvent => lastStateEvent.newState.productId) as OperatorFunction<LastStateEvent,number>,
    switchMap(productId => this._httpClient.httpGetProduct(productId)),
  )

  readonly editedProduct$: Observable<Product> = this._lastStateEvent$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'EditProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.editedProduct),
    map(lastStateEvent => lastStateEvent.newState.editedProduct) as OperatorFunction<LastStateEvent,Product>,
    switchMap(product => this._httpClient.httpPutProduct(product))
  )

  readonly deletedProduct$: Observable<Product> = this._lastStateEvent$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'DeleteProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.deletedProduct),
    map(lastStateEvent => lastStateEvent.newState.deletedProduct) as OperatorFunction<LastStateEvent,Product>,
    switchMap(product => this._httpClient.httpDeleteProduct(product))
  )
}

type LastStateEvent = {event:Event, newState:State}
type UpdateStateHandler = (oldState:State) => LastStateEvent

type Event = 
  'CreateNewProduct'|
  'RequestAllProducts'|
  'RequestSingleProduct'|
  'EditProduct'|
  'DeleteProduct'


interface State{
  newProduct?: Product,
  productId?: number
  editedProduct?: Product
  deletedProduct?: Product
}
