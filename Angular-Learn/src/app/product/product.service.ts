import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../types/product';
import { DataStoreService } from '../DataStore/data-store.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly _httpClient: DataStoreService = inject(DataStoreService)
  constructor() { }

  products$(): Observable<Product[]>{
    return this._httpClient.httpGetAllProducts()
  }

  createProduct(product:Product): Observable<Product>{
    return this._httpClient.httpPostProduct(product)
  }
}
