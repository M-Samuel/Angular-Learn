import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, of, throwError } from 'rxjs';
import { Product } from '../types/product';
import { ProductInventory } from '../types/product-inventory';
import { ProductTransaction } from '../types/product-transaction';
import { MaxLengthValidator } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ProductStoreService {

  constructor() { }

  private _productStore: Product[] = [
    {id: 1, name:"Astor", image:""},
    {id: 2, name:"Twisties", image:""},
  ]
  private _productInvetoryStore: ProductInventory[] = []
  private _productTransactionStore: ProductTransaction[] = []

  httpGetProduct(id: number): Observable<Product>{
    const products = [...this._productStore]
    const index = products.findIndex(p => p.id === id)
    if(index < 0)
      return throwError(() => 'Product Not Found')
    else
      return of(products[index])
  }

  httpGetAllProducts(): Observable<Product[]>{
    return of(this._productStore);
  }

  httpPostProduct(product: Product): Observable<Product>{
    const products = [...this._productStore]
    const newId = Math.max(...products.map(p => p.id ?? 0)) + 1
    product.id = newId
    products.push(product)

    this._productStore = products
    return of(product)
  }

  httpPutProduct(updatedProduct: Product): Observable<Product>{
    const products = [...this._productStore]
    const index = products.findIndex(p => p.id === updatedProduct.id)
    if(index < 0)
      return throwError(() => 'Product Not Found')
    else{
      products[index] = updatedProduct
      this._productStore = products
      return of(updatedProduct)
    }
  }

  httpDeleteProduct(deletedProduct: Product): Observable<Product>{
    let products = [...this._productStore]
    const index = products.findIndex(p => p.id === deletedProduct.id)
    if(index < 0)
      return throwError(() => 'Product Not Found')
    else{
      products = products.filter(p => p.id !== deletedProduct.id)
      this._productStore = products
      return of(deletedProduct)
    }
  }

  httpPostProductTransaction(productTransaction: ProductTransaction): Observable<ProductTransaction>{
    const transactions = [...this._productTransactionStore]
    const transaction = {...productTransaction, date: new Date()}
    transactions.push(transaction)
  
    this._productTransactionStore = transactions
    this._updateInventory(transaction);
    return of(transaction)
  }

  private _updateInventory(productTransaction: ProductTransaction) {
    const newInventory = [...this._productInvetoryStore];
    let productId = -1;
    if(!!productTransaction.buyOrder)
      productId = productTransaction.buyOrder.productId
    else if(!!productTransaction.sellOrder)
      productId = productTransaction.sellOrder.productId
    const productIndex = newInventory.findIndex(i => i.productId === productId)
    let productInventory: ProductInventory;
    const quantity = productTransaction.buyOrder ? productTransaction.buyOrder.quantity : ( productTransaction.sellOrder ? productTransaction.sellOrder.quantity : 0 )
    if(productIndex < 0){
      productInventory = {productId: productId, quantity: quantity}
      newInventory.push(productInventory)
    }
    else{
      productInventory =  {...newInventory[productIndex], quantity: quantity}
      newInventory[productIndex] = productInventory;
    }

    this._productInvetoryStore = newInventory
  }

  httpGetAllTransactionsByProductId(productId: number) : Observable<ProductTransaction[]>{
    return of(this._productTransactionStore.filter(t => (t.buyOrder?.productId ?? 0) === productId || (t.sellOrder?.productId ?? 0) === productId))
  }

  httpGetAllTransactions(): Observable<ProductTransaction[]>{
    return of(this._productTransactionStore)
  }


  httpGetAllInventories(): Observable<ProductInventory[]>{
    return of(this._productInvetoryStore)
  }
}
