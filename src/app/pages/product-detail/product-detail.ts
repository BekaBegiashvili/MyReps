import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, map, startWith } from 'rxjs';
import { ProductService } from '../../core/services/product';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth';
import { Product } from '../../core/models/product';

interface ProductState {
  data: Product | null;
  isLoading: boolean;
  hasError: boolean;
}

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('900ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
  ]
})
export class ProductDetail implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public state = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) =>
        this.productService.getProductById(params.get('id')!).pipe(
          map((data): ProductState => ({ data, isLoading: false, hasError: false })),
          catchError(() => of<ProductState>({ data: null, isLoading: false, hasError: true })),
          startWith<ProductState>({ data: null, isLoading: true, hasError: false }),
        ),
      ),
    ),
    { initialValue: { data: null, isLoading: true, hasError: false } as ProductState },
  );

  public product = computed(() => this.state().data);
  public isLoading = computed(() => this.state().isLoading);
  public hasError = computed(() => this.state().hasError);
  public activeImage = signal<string | null>(null);
  public currentImage = computed(() => this.activeImage() ?? this.product()?.thumbnail ?? '');
  public userRating = signal<number>(0);

  public rateProduct(star: number): void {
    this.userRating.set(star);
  }

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) this.saveToRecentlyViewed(p);
    });
  }

  ngOnInit() {
    this.cartService.getCart().subscribe();
  }

  private saveToRecentlyViewed(product: Product): void {
    const key = 'recently_viewed';
    const existing: Product[] = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter((p) => p._id !== product._id);
    const updated = [product, ...filtered].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  public selectImage(url: string): void {
    this.activeImage.set(url);
  }

  public getStars(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map((s) => s <= Math.round(rating));
  }

  public addToCart(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const product = this.product();
    if (!product) return;
    this.cartService.addProduct(product._id, 1).subscribe({
      next: () => alert('პროდუქტი კალათაში დაემატა!'),
      error: () => {
        this.cartService.updateProduct(product._id, 1).subscribe({
          next: () => alert('პროდუქტი კალათაში დაემატა!'),
          error: () => alert('შეცდომა მოხდა!'),
        });
      },
    });
  }
}