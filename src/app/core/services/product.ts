import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ProductResponse, ProductCategory, Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private baseUrl = 'https://api.everrest.educata.dev/shop';

  constructor() {}

  public getProducts(pageIndex = 1, pageSize = 12): Observable<ProductResponse> {
    const params = new HttpParams().set('page_index', pageIndex).set('page_size', pageSize);

    return this.http.get<ProductResponse>(`${this.baseUrl}/products/all`, { params });
  }

  public rateProduct(productId: string, rate: number): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products/rate`, { productId, rate });
  }

  public getProductsByCategory(
    categoryId: string,
    pageIndex = 1,
    pageSize = 12,
  ): Observable<ProductResponse> {
    const params = new HttpParams().set('page_index', pageIndex).set('page_size', pageSize);
    return this.http.get<ProductResponse>(`${this.baseUrl}/products/category/${categoryId}`, {
      params,
    });
  }

  public getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/id/${id}`);
  }

  public getProductsByBrand(
    brandName: string,
    pageIndex = 1,
    pageSize = 12,
  ): Observable<ProductResponse> {
    const params = new HttpParams().set('page_index', pageIndex).set('page_size', pageSize);
    return this.http.get<ProductResponse>(`${this.baseUrl}/products/brand/${brandName}`, {
      params,
    });
  }

  public getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.baseUrl}/products/categories`);
  }

  public getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/brands`);
  }

  getDiscountedProducts(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/shop/products/all?page_size=38`)
      .pipe(
        map((data: any) =>
          data.products
            .sort((a: any, b: any) => b.price.discountPercentage - a.price.discountPercentage)
            .slice(0, 8),
        ),
      );
  }

  searchProducts(keywords: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/shop/products/search?keywords=${keywords}`);
  }
}
