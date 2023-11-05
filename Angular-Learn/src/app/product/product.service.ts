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
    this._stateEvent$.subscribe(stateEvent => {
      const newState = this.dispatchEvent(stateEvent, this._stateSubject$.value)
      this._stateSubject$.next(newState)
    })
  }
  

  private readonly _stateEventSubject$ = new Subject<StateEvent>()
  private readonly _stateSubject$ = new BehaviorSubject<State>({} as State)
  private readonly _stateEvent$ = this._stateEventSubject$.asObservable()
  private readonly _state$ = this._stateSubject$.asObservable().pipe(
    filter(state => !!state.lastEvent)
  )

  emitEvent(stateEvent: StateEvent){
    console.log(stateEvent, `Emitted Event`)
    this._stateEventSubject$.next(stateEvent)
  }

  dispatchEvent(stateEvent: StateEvent, oldState: State): State{
    let newState:State = {...oldState, lastEvent: stateEvent}
    if(stateEvent.action === 'CreateNewProduct')
      Object.assign(newState,{newProduct: stateEvent.value})
    if(stateEvent.action === 'RequestSingleProduct')
      Object.assign(newState,{productId: stateEvent.value})

      console.log(newState)
    return newState
  }


  readonly products$: Observable<Product[]> = this._state$.pipe(
    filter(state => state.lastEvent.action === 'RequestAllProducts'),
    switchMap(state => this._httpClient.httpGetAllProducts())
  )

  readonly createdProduct$ = this._state$.pipe(
    filter(state => state.lastEvent.action === 'CreateNewProduct'),
    filter(state => !!state.newProduct),
    map(state => state.newProduct) as OperatorFunction<State,Product>,
    switchMap(product => this._httpClient.httpPostProduct(product)),
    shareReplay(1)
  )

  readonly productById$: Observable<Product> = this._state$.pipe(
    filter(state => state.lastEvent.action === 'RequestSingleProduct'),
    filter(state => !!state.productId),
    map(state => state.productId) as OperatorFunction<State,number>,
    switchMap(productId => this._httpClient.httpGetProduct(productId)),
  )
}

export interface StateEvent{
  value: any,
  action: 
  'PageLoad'|
  'CreateNewProduct'|
  'RequestAllProducts'|
  'RequestSingleProduct'
}

interface State{
  lastEvent: StateEvent,
  newProduct?: Product,
  productId?: number
}
