import { Component, NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { ProductCreationComponent } from './product-creation/product-creation.component';
import { ProductEditingComponent } from './product-editing/product-editing.component';
import { ProductService } from './product/product.service';
import { ProductTransactionComponent } from './product-transaction/product-transaction.component';

const routes: Routes = [
  { path: 'product/new', component: ProductCreationComponent },
  { path: 'product/all', component: ProductComponent },
  { path: 'product/:id/edit', component: ProductEditingComponent, 
    resolve: {
      product: productResolver
    }
  },
  { path: 'product/buysell', component: ProductTransactionComponent,}
];

function productResolver(route: ActivatedRouteSnapshot){
  const id = parseInt(route.paramMap.get('id') ?? "-1")
  const productService: ProductService = inject(ProductService)
  productService.emitEventRequestSingleProduct(id)
  return productService.productById$
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
