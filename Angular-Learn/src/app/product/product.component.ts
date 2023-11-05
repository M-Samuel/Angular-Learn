import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from '../types/product';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit{
  private readonly _productService:ProductService = inject(ProductService)
  
  readonly products$: Observable<Product[]> = this._productService.products$
  readonly createdProduct$: Observable<Product> = this._productService.createdProduct$
  
  
  ngOnInit(): void {
    this._productService.emitEvent({action: 'RequestAllProducts', value: undefined})
  }

  createProduct(){
    const newProduct: Product = {name:"Smarties",image:""}
    this._productService.emitEvent({action:'CreateNewProduct', value: newProduct})
  }
}
