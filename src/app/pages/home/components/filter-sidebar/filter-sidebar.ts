import { CommonModule } from '@angular/common';
import { Component, inject, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../../core/services/product';
import { ProductCategory, FilterState } from '../../../../core/models/product';

@Component({
  selector: 'app-filter-sidebar',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './filter-sidebar.html',
  styleUrl: './filter-sidebar.scss',
})
export class FilterSidebarComponent implements OnInit {
  private productService = inject(ProductService);
  public filtersChange = output<Partial<FilterState>>();
  public categories = signal<ProductCategory[]>([]);
  public brands = signal<string[]>([]);
  public isLoading = signal(true);
  public openSections = signal<Record<string, boolean>>({
    category: false,
    brand: false,
    rating: false,
    price: false,
  });
  public selectedCategory = signal<string | null>(null);
  public selectedBrand = signal<string | null>(null);
  public selectedRating = signal<number>(0);
  public minPrice = signal<number>(0);
  public maxPrice = signal<number>(9999);

  public ngOnInit(): void {
    forkJoin({
      categories: this.productService.getCategories(),
      brands: this.productService.getBrands(),
    }).subscribe({
      next: ({ categories, brands }) => {
        this.categories.set(categories);
        this.brands.set(brands);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  public toggleSection(section: string): void {
    this.openSections.update((s) => ({ ...s, [section]: !s[section] }));
  }

  public selectBrand(brand: string): void {
    const next = this.selectedBrand() === brand ? null : brand;
    this.selectedBrand.set(next);
    this.emit();
  }

  public selectCategory(id: string): void {
    const next = this.selectedCategory() === id ? null : id;
    this.selectedCategory.set(next);
    this.emit();
  }

  public selectRating(rating: number): void {
    const next = this.selectedRating() === rating ? 0 : rating;
    this.selectedRating.set(next);
    this.emit();
  }

  public onPriceChange(): void {
    this.emit();
  }

  public resetAll(): void {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.selectedRating.set(0);
    this.minPrice.set(0);
    this.maxPrice.set(9999);
    this.openSections.set({
      category: false,
      brand: false,
      rating: false,
      price: false,
    });
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({
      categoryId: this.selectedCategory(),
      brand: this.selectedBrand(),
      minRating: this.selectedRating(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      page: 1,
    });
  }
}