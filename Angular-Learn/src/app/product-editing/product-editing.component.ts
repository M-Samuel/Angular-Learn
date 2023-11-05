import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../types/product';

@Component({
  selector: 'app-product-editing',
  templateUrl: './product-editing.component.html',
  styleUrls: ['./product-editing.component.scss']
})
export class ProductEditingComponent implements OnInit{
  private readonly activateRoute: ActivatedRoute = inject(ActivatedRoute)
  product!: Product

  ngOnInit(): void {
    this.product = this.activateRoute.snapshot.data['product']
  }

  
}
