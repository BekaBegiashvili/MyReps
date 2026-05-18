export interface ProductPrice {
  current: number;
  currency: string;
  beforeDiscount: number;
  discountPercentage: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  image: string;
}

export interface ProductRating {
  userId: string;
  value: number;
  createdAt: string;
}

export interface Product {
  price: ProductPrice;
  category: ProductCategory;
  _id: string;
  title: string;
  description: string;
  issueDate: string;
  thumbnail: string;
  stock: number;
  rating: number;
  brand: string;
  warranty: number;
  images: string[];
  ratings?: ProductRating[];
}

export interface ProductResponse {
  total: number;
  limit: number;
  page: number;
  skip: number;
  products: Product[];
}

export interface FilterState {
  categoryId: string | null;
  brand: string | null;
  minRating: number;
  minPrice: number;
  maxPrice: number;
  page: number;
}
