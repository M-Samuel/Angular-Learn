import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, OperatorFunction, Subject, delay, filter, from, map, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { Product } from '../types/product';
import { DataStoreService } from '../DataStore/data-store.service';
import { ProductInventory } from '../types/product-inventory';
import { ProductTransaction } from '../types/product-transaction';

@Injectable({
  providedIn: 'root'
})


export class ProductService {

  private readonly _httpClient: DataStoreService = inject(DataStoreService)

  
  getAllProducts$(): Observable<Product[]>{
    return this._httpClient.httpGetAllProducts()
  }

  createProduct$(product: Product):Observable<Product>{
    return this._httpClient.httpPostProduct(product)
  }

  getProductById$(productId:number):Observable<Product>{
    return this._httpClient.httpGetProduct(productId)
  }

  getAllInventories$():Observable<ProductInventory[]>{
    return this._httpClient.httpGetAllInventories()
  }

  getAllTransactionPerProduct$(productId:number){
    return this._httpClient.httpGetAllTransactionsByProductId(productId)
  }


  editProduct$(product:Product): Observable<Product>{
    return this._httpClient.httpPutProduct(product)
  }


  deleteProduct$(product:Product): Observable<Product>{
    return this._httpClient.httpDeleteProduct(product)
  }

  getInventoryPerProduct$(productId:number):Observable<ProductInventory>{
    return this.getAllInventories$().pipe(
      switchMap(inventories => from(inventories)),
      filter(inventory => inventory.productId === productId)
    )
  }

  createTransaction$(transaction:ProductTransaction):Observable<ProductTransaction>{
    return this._httpClient.httpPostProductTransaction(transaction)
  }
}

