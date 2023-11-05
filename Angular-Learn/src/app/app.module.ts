import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductComponent } from './product/product.component';
import { ProductCreationComponent } from './product-creation/product-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductEditingComponent } from './product-editing/product-editing.component';
@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    ProductCreationComponent,
    ProductEditingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
