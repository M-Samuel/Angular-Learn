import { Injectable, inject } from '@angular/core';
import { ProductStoreService } from './product-store.service';
import { Observable } from 'rxjs';
import { Product } from '../types/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly _httpClient: ProductStoreService = inject(ProductStoreService)
  constructor() { }

  readonly products$: Observable<Product[]> = this._httpClient.httpGetAllProducts()

  createProduct(product:Product){
    this._httpClient.httpPostProduct(product)
  }
}
