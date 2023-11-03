import { Component, inject } from '@angular/core';
import { ProductService } from './product/product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular-Learn';

  private readonly _productService:ProductService = inject(ProductService)

  readonly products$ = this._productService.products$()

  createProduct(){
    this._productService.createProduct({name:"Smarties",image:""})
  }
}
