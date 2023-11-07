import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, OperatorFunction, Subject, filter, map, shareReplay, switchMap, tap } from 'rxjs';
import { Product } from '../types/product';
import { DataStoreService } from '../DataStore/data-store.service';

@Injectable({
  providedIn: 'root'
})


export class ProductService {

  private readonly _httpClient: DataStoreService = inject(DataStoreService)
  constructor() {
    this._stateEventHandler$.subscribe(stateEventHandler => {
      const newState = stateEventHandler(this._stateSubject$.value)
      this._stateSubject$.next(newState)
    })
  }
  

  private readonly _stateEventHandlerSubject$ = new Subject<UpdateStateHandler>()
  private readonly _stateSubject$ = new BehaviorSubject<State>({} as State)
  private readonly _stateEventHandler$ = this._stateEventHandlerSubject$.asObservable()
  private readonly _state$ = this._stateSubject$.asObservable().pipe(
    filter(state => !!state.lastEvent)
  )

  emitEventCreateNewProduct(newProduct: Product){
    console.log(newProduct, `emitEventCreateNewProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      return {...oldState, lastEvent: 'CreateNewProduct', newProduct: newProduct}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventRequestSingleProduct(productId: number){
    console.log(productId, `emitEventRequestSingleProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      return {...oldState, lastEvent: 'RequestSingleProduct', productId: productId}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventEditProduct(editedProduct: Product){
    console.log(editedProduct, `emitEventEditProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      return {...oldState, lastEvent: 'EditProduct', editedProduct: editedProduct}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventDeleteProduct(deletedProduct: Product){
    console.log(deletedProduct, `emitEventDeleteProduct`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      return {...oldState, lastEvent: 'DeleteProduct', deletedProduct: deletedProduct}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  emitEventRequestAllProducts(){
    console.log(undefined, `emitEventRequestAllProducts`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      return {...oldState, lastEvent: 'RequestAllProducts'}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }


  readonly products$: Observable<Product[]> = this._state$.pipe(
    filter(state => state.lastEvent === 'RequestAllProducts'),
    switchMap(state => this._httpClient.httpGetAllProducts())
  )

  readonly createdProduct$ = this._state$.pipe(
    filter(state => state.lastEvent === 'CreateNewProduct'),
    filter(state => !!state.newProduct),
    map(state => state.newProduct) as OperatorFunction<State,Product>,
    switchMap(product => this._httpClient.httpPostProduct(product))
  )

  readonly productById$: Observable<Product> = this._state$.pipe(
    filter(state => state.lastEvent === 'RequestSingleProduct'),
    filter(state => !!state.productId),
    map(state => state.productId) as OperatorFunction<State,number>,
    switchMap(productId => this._httpClient.httpGetProduct(productId)),
  )

  readonly editedProduct$: Observable<Product> = this._state$.pipe(
    filter(state => state.lastEvent === 'EditProduct'),
    filter(state => !!state.editedProduct),
    map(state => state.editedProduct) as OperatorFunction<State,Product>,
    switchMap(product => this._httpClient.httpPutProduct(product))
  )

  readonly deletedProduct$: Observable<Product> = this._state$.pipe(
    filter(state => state.lastEvent === 'DeleteProduct'),
    filter(state => !!state.deletedProduct),
    map(state => state.deletedProduct) as OperatorFunction<State,Product>,
    switchMap(product => this._httpClient.httpDeleteProduct(product))
  )
}

type UpdateStateHandler = (state:State) => State

type StateEvent = 
  'CreateNewProduct'|
  'RequestAllProducts'|
  'RequestSingleProduct'|
  'EditProduct'|
  'DeleteProduct'


interface State{
  lastEvent: StateEvent,
  newProduct?: Product,
  productId?: number
  editedProduct?: Product
  deletedProduct?: Product
}
