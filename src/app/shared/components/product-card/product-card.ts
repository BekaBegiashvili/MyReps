import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCardComponent {
  public product = input.required<Product>();
}
