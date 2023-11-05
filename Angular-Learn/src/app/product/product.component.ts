import { Component, inject } from '@angular/core';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  private readonly _productService:ProductService = inject(ProductService)

  products$ = this._productService.products$()

  createProduct(){
    this._productService.createProduct({name:"Smarties",image:""})
  }
}
