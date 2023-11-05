import { Injectable } from '@angular/core';
import { EMPTY, Observable, delay, map, of, throwError } from 'rxjs';
import { Product } from '../types/product';
import { ProductInventory } from '../types/product-inventory';
import { ProductTransaction } from '../types/product-transaction';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  constructor() { }

  private _productStore: Product[] = [
    {id: 1, name:"Astor", image:"https://metiecom.s3.us-east-2.amazonaws.com/800_X_800/100277.jpg"},
    {id: 2, name:"Twisties", image:"https://metiecom.s3.us-east-2.amazonaws.com/800_X_800/129799.jpg"},
  ]
  private _productInvetoryStore: ProductInventory[] = []
  private _productTransactionStore: ProductTransaction[] = []

  httpGetProduct(id: number): Observable<Product>{
    return of(null).pipe(
      map(_ => {
        const products = [...this._productStore]
        const index = products.findIndex(p => p.id === id)
        if(index < 0)
          throw new Error("Product not found - GET")
        else
          return products[index]
      })
    )
  }

  httpGetAllProducts(): Observable<Product[]>{
    return of(null).pipe(
      map(_ => this._productStore)
    )
  }

  httpPostProduct(product: Product): Observable<Product>{
    return of(null).pipe(
      map(_ => {
        const products = [...this._productStore]
        const newId = products.length === 0 ? 1 : (Math.max(...products.map(p => p.id ?? 0)) + 1)
        product.id = newId
        products.push(product)

        this._productStore = products
        return product
      })
    )
  }

  httpPutProduct(updatedProduct: Product): Observable<Product>{
    return of(null).pipe(
      map(_ => {
        const products = [...this._productStore]
        const index = products.findIndex(p => p.id === updatedProduct.id)
        if(index < 0)
          throw new Error('Product Not Found - EDIT')
        else{
          products[index] = updatedProduct
          this._productStore = products
          return updatedProduct
        }
      })
    )
  }

  httpDeleteProduct(deletedProduct: Product): Observable<Product>{
    return of(null).pipe(
      map(_ => {
        let products = [...this._productStore]
        console.log(products)
        const index = products.findIndex(p => p.id === deletedProduct.id)
        if(index < 0)
          throw new Error('Product Not Found - DELETE')
        else{
          products = products.filter(p => p.id !== deletedProduct.id)
          this._productStore = products
          return deletedProduct
        }
      })
    )
    
  }

  httpPostProductTransaction(productTransaction: ProductTransaction): Observable<ProductTransaction>{
    return of(null).pipe(
      map(_ => {
        const transactions = [...this._productTransactionStore]
        const transaction = {...productTransaction, date: new Date()}
        transactions.push(transaction)
      
        this._productTransactionStore = transactions
        this._updateInventory(transaction);
        return transaction
      })
    )
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
