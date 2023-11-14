import { Observable, Subject, Subscription, map, shareReplay, tap } from "rxjs"

export class EventSourcing<S extends {}, E>{
    private readonly _state: S = {} as S

    private readonly _stateEventHandlerSubject$ = new Subject<UpdateStateHandler<S, E>>()
    readonly lastStateEvent$: Observable<LastStateEvent<S, E>> = this._stateEventHandlerSubject$.asObservable().pipe(
        shareReplay(1, 500),
        map(updateStateHandler => updateStateHandler(this._state)),
        tap(lastStateEvent => Object.assign(this._state, lastStateEvent.newState))
    )
   private readonly sub: Subscription

    constructor() {
        this.sub = this.lastStateEvent$.subscribe(lastStateEvent => console.log(lastStateEvent))
    }

    OnDestroy() {
        this.sub.unsubscribe()
    }

    emit(updateStateFunc: UpdateStateHandler<S, E>) {
        this._stateEventHandlerSubject$.next(updateStateFunc)
    }

}

export type LastStateEvent<S, E> = { event: E, newState: S }
type UpdateStateHandler<S, E> = (oldState: S) => LastStateEvent<S, E>