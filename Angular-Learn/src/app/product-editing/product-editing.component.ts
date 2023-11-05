import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../types/product';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { simpleUrlValidator } from '../product-creation/product-creation.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-editing',
  templateUrl: './product-editing.component.html',
  styleUrls: ['./product-editing.component.scss']
})
export class ProductEditingComponent implements OnInit, OnDestroy{
  private readonly activateRoute: ActivatedRoute = inject(ActivatedRoute)
  product!: Product
  hasSubmitted: boolean = false
  editedProductSubscription: Subscription;

  private readonly _formBuilder = inject(FormBuilder)
  private readonly _productService = inject(ProductService)

  readonly editProductFG = this._formBuilder.group({
    name: new FormControl<string|null>(null,{validators: [Validators.required, Validators.maxLength(20)], updateOn: 'submit'}),
    image: new FormControl<string|null>(null,{validators: [Validators.required, simpleUrlValidator], updateOn: 'submit'})
  })

  readonly editedProduct$: Observable<Product> = this._productService.editedProduct$
  
  constructor(){
    this.editedProductSubscription = this.editedProduct$.subscribe(
      editedProduct => this.product = editedProduct
    )
  }
  ngOnDestroy(): void {
    this.editedProductSubscription.unsubscribe()
  }

  ngOnInit(): void {
    this.product = this.activateRoute.snapshot.data['product']
  }

  onSubmit(){
    this.hasSubmitted = true
    if(this.editProductFG.valid){
      const product: Product = {...this.product} as Product
      Object.assign(product, this.editProductFG.value)
      console.log(product)
      this._productService.emitEvent({action:'EditProduct',value:product})
    }
    else{
      console.log(this.editProductFG)
    }
  }

  get nameControl(){
    return this.editProductFG.controls['name']
  }

  get imageControl(){
    return this.editProductFG.controls['image']
  }

}
