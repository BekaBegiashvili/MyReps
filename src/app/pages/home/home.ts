import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';
import * as L from 'leaflet';
import { ProductService } from '../../core/services/product';
import { Product } from '../../core/models/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('fadeLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }),
        ),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private http = inject(HttpClient);

  products$ = this.productService.getDiscountedProducts();
  quote = signal<{ quote: string; author: string; type: string } | null>(null);
  recentlyViewed = signal<Product[]>([]);
  currentSlide = signal(0);

  constructor() {
    this.http.get<any>('https://api.everrest.educata.dev/quote/random').subscribe({
      next: (data) => this.quote.set(data),
      error: () => {},
    });
  }

  ngOnInit() {
    const saved = localStorage.getItem('recently_viewed');
    if (saved) this.recentlyViewed.set(JSON.parse(saved));
  }

  ngAfterViewInit() {
    const map = L.map('map', {
      center: [41.6938, 44.8015],
      zoom: 13,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map);
    const icon = L.divIcon({
      html: `<div style="
        width: 16px; height: 16px;
        background: #3BBA9C;
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 0 12px #3BBA9C;
      "></div>`,
      iconSize: [16, 16],
      className: '',
    });
    L.marker([41.6938, 44.8015], { icon })
      .addTo(map)
      .bindPopup('<b>IT Step TechShop</b><br>თბილისი, საქართველო')
      .openPopup();
  }

  get totalSlides(): number {
    return Math.ceil(this.recentlyViewed().length / 3);
  }

  prevSlide() {
    this.currentSlide.update((s) => (s > 0 ? s - 1 : this.totalSlides - 1));
  }

  nextSlide() {
    this.currentSlide.update((s) => (s < this.totalSlides - 1 ? s + 1 : 0));
  }

  get visibleProducts(): Product[] {
    const start = this.currentSlide() * 3;
    return this.recentlyViewed().slice(start, start + 3);
  }
}
