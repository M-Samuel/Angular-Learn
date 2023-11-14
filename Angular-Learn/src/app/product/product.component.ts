import { Component, inject } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../types/product';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent{
  private readonly _productService:ProductService = inject(ProductService)
  
  readonly products$: Observable<Product[]> = this._productService.getAllProducts$()

}

