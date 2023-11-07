import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '../DataStore/data-store.service';
import { Product } from '../types/product';
import { BehaviorSubject, Observable, OperatorFunction, Subject, filter, map, shareReplay, switchMap, tap } from 'rxjs';
import { ProductTransaction } from '../types/product-transaction';

@Injectable({
  providedIn: 'root'
})
export class ProductTransactionService {

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

  emitEventRequestTransactionsPerProduct(productId: number){
    console.log(undefined, 'emitEventRequestTransactionsPerProduct');
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState = {...oldState, productId: productId}
      return {newState: newState, event: 'RequestTransactionsPerProduct'}
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }

  readonly transactionsPerProduct$: Observable<ProductTransaction[]> = this._lastStateEvent$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'RequestTransactionsPerProduct'),
    filter(lastStateEvent => !!lastStateEvent.newState.productId),
    map(lastStateEvent => lastStateEvent.newState.productId) as OperatorFunction<LastStateEvent,number>,
    switchMap(productId => this._httpClient.httpGetAllTransactionsByProductId(productId))
  )
}

type LastStateEvent = {event:Event, newState:State}
type UpdateStateHandler = (oldState:State) => LastStateEvent

type Event = 
  'RequestTransactionsPerProduct'


interface State{
  productId?: number
}
