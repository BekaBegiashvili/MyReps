import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, map, startWith } from 'rxjs';
import { ProductService } from '../../core/services/product';
import { ProductResponse, FilterState } from '../../core/models/product';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { FilterSidebarComponent } from '../home/components/filter-sidebar/filter-sidebar';

interface ProductsState {
  data: ProductResponse | null;
  isLoading: boolean;
  hasError: boolean;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, TranslateModule, ProductCardComponent, FilterSidebarComponent],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('900ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
  ]
})
export class ShopComponent {
  private productService = inject(ProductService);
  public pageSize = 12;
  public filters = signal<FilterState>({
    categoryId: null,
    brand: null,
    minRating: 0,
    minPrice: 0,
    maxPrice: 9999,
    page: 1,
  });
  public currentPage = computed(() => this.filters().page);
  public state = toSignal(
    toObservable(this.filters).pipe(
      switchMap((f) => {
        let request$;
        if (f.categoryId) {
          request$ = this.productService.getProductsByCategory(f.categoryId, f.page, this.pageSize);
        } else if (f.brand) {
          request$ = this.productService.getProductsByBrand(f.brand, f.page, this.pageSize);
        } else {
          request$ = this.productService.getProducts(f.page, this.pageSize);
        }
        return request$.pipe(
          map((data): ProductsState => ({ data, isLoading: false, hasError: false })),
          catchError(() => of<ProductsState>({ data: null, isLoading: false, hasError: true })),
          startWith<ProductsState>({ data: null, isLoading: true, hasError: false }),
        );
      }),
    ),
    { initialValue: { data: null, isLoading: true, hasError: false } as ProductsState },
  );
  public products = computed(() => {
    const f = this.filters();
    return (this.state().data?.products ?? []).filter(
      (p) =>
        (!f.brand || p.brand.toLowerCase() === f.brand.toLowerCase()) &&
        (!f.categoryId || p.category.id === f.categoryId) &&
        p.rating >= f.minRating &&
        p.price.current >= f.minPrice &&
        p.price.current <= f.maxPrice,
    );
  });
  public isLoading = computed(() => this.state().isLoading);
  public hasError = computed(() => this.state().hasError);
  public totalProducts = computed(() => this.state().data?.total ?? 0);
  public totalPages = computed(() => Math.ceil(this.totalProducts() / this.pageSize));
  public pageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  });
  public onFiltersChange(partial: Partial<FilterState>): void {
    this.filters.update((f) => ({ ...f, ...partial, page: 1 }));
  }
  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.filters.update((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  public reload(): void {
    this.filters.update((f) => ({ ...f }));
  }
}