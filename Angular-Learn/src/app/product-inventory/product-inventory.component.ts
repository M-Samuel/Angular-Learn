import { Component, OnInit, inject } from '@angular/core';
import { ProductInventoryService } from './product-inventory.service';
import { EMPTY, Observable, buffer, bufferCount, bufferToggle, bufferWhen, forkJoin, from, map, of, switchMap, take, takeLast, takeUntil, takeWhile, tap, toArray } from 'rxjs';
import { ProductInventory } from '../types/product-inventory';
import { ProductService } from '../product/product.service';
import { Product } from '../types/product';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent implements OnInit{
  private readonly _productInventoryService = inject(ProductInventoryService)
  private readonly _productService = inject(ProductService)
  
  readonly productInventories$:Observable<{inventory:ProductInventory, product:Product}[]> = this._productInventoryService.productInventories$.pipe(
    take(1),
    switchMap(inventories => from(inventories)),
    switchMap(inventory => {
      this._productService.emitEventRequestSingleProduct(inventory.productId)
      return forkJoin([of(inventory), this._productService.productById$.pipe(take(1))])
    }),
    map(([inventory,product]) => {
      console.log(inventory)
      return {inventory: inventory, product: product}
    }),
    toArray()
  )
  


  ngOnInit(): void {
    this._productInventoryService.emitEventRequestAllInventory()
  }
}
