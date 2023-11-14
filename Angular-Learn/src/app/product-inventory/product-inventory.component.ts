import { Component, inject } from '@angular/core';
import { Observable, combineLatest, from, map, of, switchMap, toArray } from 'rxjs';
import { ProductInventory } from '../types/product-inventory';
import { ProductService } from '../services/product.service';
import { Product } from '../types/product';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent{
  private readonly _productService = inject(ProductService)
  
  readonly productInventories$:Observable<{inventory:ProductInventory, product:Product}[]> 
  = this._productService.getAllInventories$().pipe(
    switchMap(inventories => from(inventories)),
    switchMap(inventory => combineLatest([of(inventory), this._productService.getProductById$(inventory.productId)])),
    map(([inventory,product]) => {
      return {inventory: inventory, product: product}
    }),
    toArray()
  )
  
}
