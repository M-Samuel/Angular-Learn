import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '../DataStore/data-store.service';
import { Product } from '../types/product';
import { BehaviorSubject, Observable, OperatorFunction, Subject, filter, map, switchMap, tap } from 'rxjs';
import { ProductTransaction } from '../types/product-transaction';

@Injectable({
  providedIn: 'root'
})
export class ProductTransactionService {

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
    filter(state => !!state.lastEvent),
    tap(state => this._resetLastEvent(state))
  )

  private _resetLastEvent(state: State): void{
    this._stateSubject$.next({...state, lastEvent: undefined}) 
  }

  emitEventRequestTransactionsPerProduct(productId: number){
    console.log(undefined, 'emitEventRequestTransactionsPerProduct');
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      return {...oldState, lastEvent: 'RequestTransactionsPerProduct', productId: productId}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  readonly transactionsPerProduct$: Observable<ProductTransaction[]> = this._state$.pipe(
    filter(state => state.lastEvent === 'RequestTransactionsPerProduct'),
    filter(state => !!state.productId),
    map(state => state.productId) as OperatorFunction<State,number>,
    switchMap(productId => this._httpClient.httpGetAllTransactionsByProductId(productId))
  )
}

type UpdateStateHandler = (state:State) => State

type StateEvent = 
  'RequestTransactionsPerProduct'


interface State{
  lastEvent: StateEvent | undefined,
  productId?: number
}
