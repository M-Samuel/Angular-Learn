import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '../DataStore/data-store.service';
import { Observable, Subject, filter, map, shareReplay, switchMap, tap } from 'rxjs';
import { ProductInventory } from '../types/product-inventory';

@Injectable({
  providedIn: 'root'
})
export class ProductInventoryService {

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

  emitEventRequestAllInventory(){
    console.log(undefined, `emitEventRequestAllInventory`)
    const updateStateHandler:UpdateStateHandler = (oldState) => {
      const newState:State = {...oldState}
      return {newState: newState, event: 'RequestAllInventory'} 
    }
    this._stateEventHandlerSubject$.next(updateStateHandler)
  }


  readonly productInventories$: Observable<ProductInventory[]> = this._lastStateEvent$.pipe(
    filter(stateEvent => stateEvent.event === 'RequestAllInventory'),
    switchMap(stateEvent => this._httpClient.httpGetAllInventories())
  )
}

type LastStateEvent = {event:Event, newState:State}
type UpdateStateHandler = (oldState:State) => LastStateEvent

type Event = 
  'RequestAllInventory'


interface State{
}
