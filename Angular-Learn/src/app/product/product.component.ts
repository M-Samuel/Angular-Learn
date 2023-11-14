import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from '../types/product';
import { Observable, filter, switchMap, take, tap } from 'rxjs';
import { EventSourcing } from '../Helpers/EventSourcing';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit{
  private readonly _productService:ProductService = inject(ProductService)
  private readonly _eventSourcing:EventSourcing<State,Event> = new EventSourcing<State,Event>()
  private readonly _eventStream$ = this._eventSourcing.lastStateEvent$
  
  readonly products$: Observable<Product[]> = this._eventStream$.pipe(
    filter(lastStateEvent => lastStateEvent.event === 'RequestAllProducts'),
    switchMap(lastStateEvent => this._productService.getAllProducts()),
  )
  
  ngOnInit(): void {
    this.emitEventRequestAllProducts()
  }

  emitEventRequestAllProducts(){
    console.log(undefined, `emitEventRequestAllProducts`)
    this._eventSourcing.emit((oldState) => {
      const newState:State = {...oldState}
      return {newState: newState, event: 'RequestAllProducts'}
    })
  }

}


type Event = 
  'RequestAllProducts'


interface State{
}
