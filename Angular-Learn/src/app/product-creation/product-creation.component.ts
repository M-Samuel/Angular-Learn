import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { Product } from '../types/product';

@Component({
  selector: 'app-product-creation',
  templateUrl: './product-creation.component.html',
  styleUrls: ['./product-creation.component.scss']
})
export class ProductCreationComponent {
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)

  readonly createProductFG = this._formBuilder.group({
    name: [null, [Validators.required, Validators.maxLength(20)]],
    image: [null, [Validators.required]],
  })

  readonly createdProduct$ = this._productService.createdProduct$
  

  onSubmit(){
    
    if(this.createProductFG.valid){
      const product: Product = {} as Product
      Object.assign(product, this.createProductFG.value)
      console.log(product)
      this._productService.emitEvent({action:'CreateNewProduct',value:product})
    }

  }
}
