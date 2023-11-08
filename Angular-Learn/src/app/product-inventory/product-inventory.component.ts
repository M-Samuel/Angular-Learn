import { Component, OnInit, inject } from '@angular/core';
import { ProductInventoryService } from './product-inventory.service';
import { Observable } from 'rxjs';
import { ProductInventory } from '../types/product-inventory';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent implements OnInit{
  private readonly _productInventoryService = inject(ProductInventoryService)
  
  readonly productsInventory$: Observable<ProductInventory[]> = this._productInventoryService.productsInventory$

  ngOnInit(): void {
    this._productInventoryService.emitEventRequestAllInventory()
  }
}
