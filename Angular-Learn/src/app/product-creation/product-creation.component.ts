import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { Product } from '../types/product';

@Component({
  selector: 'app-product-creation',
  templateUrl: './product-creation.component.html',
  styleUrls: ['./product-creation.component.scss']
})
export class ProductCreationComponent{
  hasSubmitted = false;
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)

  readonly createProductFG = this._formBuilder.group({
    name: new FormControl<string|null>(null,{validators: [Validators.required, Validators.maxLength(20)], updateOn: 'submit'}),
    image: new FormControl<string|null>(null,{validators: [Validators.required, simpleUrlValidator], updateOn: 'submit'})
  })

  readonly createdProduct$ = this._productService.createdProduct$


  onSubmit(){
    this.hasSubmitted = true
    if(this.createProductFG.valid){
      const product: Product = {} as Product
      Object.assign(product, this.createProductFG.value)
      console.log(product)
      this._productService.emitEventCreateNewProduct(product)
    }
    else{
      console.log(this.createProductFG)
    }
  }

  get nameControl(){
    return this.createProductFG.controls['name']
  }

  get imageControl(){
    return this.createProductFG.controls['image']
  }
}


export function simpleUrlValidator(control:AbstractControl): ValidationErrors | null{
  const value:string = control.value
  if(!value) return null

  const validationError: ValidationErrors | null= !value.includes('http') ? {invalidUrlFormat:true} : null

  return validationError
}