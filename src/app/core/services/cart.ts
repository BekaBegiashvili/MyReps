import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart } from '../models/cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API = 'https://api.everrest.educata.dev/shop/cart';
  private http = inject(HttpClient);

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.API).pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  clearCart(): Observable<{ success: boolean }> {
    return this.http
      .delete<{ success: boolean }>(this.API)
      .pipe(tap(() => this.cartSubject.next(null)));
  }

  addProduct(id: string, quantity: number): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.API}/product`, { id, quantity })
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  updateProduct(id: string, quantity: number): Observable<Cart> {
    return this.http
      .patch<Cart>(`${this.API}/product`, { id, quantity })
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  removeProduct(id: string): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.API}/product`, { body: { id } })
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }
  checkout(): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${this.API}/checkout`, {})
      .pipe(tap(() => this.cartSubject.next(null)));
  }
}
