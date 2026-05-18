import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart';
import { ThemeService } from '../../../core/services/theme';
import { User } from '../../../core/models/user';
import { Cart } from '../../../core/models/cart';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  animations: [
    trigger('fadeDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('700ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Navbar implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: any[] = [];
  currentUser: User | null = null;
  cart: Cart | null = null;
  isCartOpen = false;
  currentTheme = 'default';
  currentLang = 'ka';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  get cartCount(): number {
    return this.cart?.total.quantity ?? 0;
  }

  ngOnInit() {
    this.currentTheme = this.themeService.getCurrentTheme();
    const savedLang = localStorage.getItem('lang') || 'ka';
    this.currentLang = savedLang;
    this.translate.use(savedLang);

    // user subscription
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (user) this.cartService.getCart().pipe(takeUntil(this.destroy$)).subscribe();
      });

    // cart subscription — ერთი წყარო, ყველგან
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => (this.cart = cart));

    // search debounce — ყოველ keystroke-ზე არ გაიგზავნება request
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((query) => {
      if (query.trim()) {
        this.productService.searchProducts(query)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => (this.searchResults = data.products));
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleLang() {
    const next = this.currentLang === 'ka' ? 'en' : 'ka';
    this.currentLang = next;
    this.translate.use(next);
    localStorage.setItem('lang', next);
  }

  switchTheme() {
    const themes = ['default', 'theme-green', 'theme-purple', 'theme-pink', 'theme-light', 'theme-sunset'];
    const currentIndex = themes.indexOf(this.currentTheme);
    this.themeService.applyTheme(themes[(currentIndex + 1) % themes.length]);
    this.currentTheme = themes[(currentIndex + 1) % themes.length];
  }

  // getCart() აღარ იძახება — cart$ subscription საკმარისია
  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateProduct(productId, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  removeProduct(productId: string) {
    this.cartService.removeProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  clearCart() {
    this.cartService.clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => (this.isCartOpen = false) });
  }

  checkout() {
    this.cartService.checkout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('შეკვეთა წარმატებით განხორციელდა! ✅');
          this.isCartOpen = false;
        },
        error: () => alert('შეცდომა მოხდა!')
      });
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  navigateToProduct(id: string) {
    this.searchResults = [];
    this.searchQuery = '';
    this.router.navigate(['/shop', id]);
  }
}