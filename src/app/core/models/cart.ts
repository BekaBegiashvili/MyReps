export interface CartProduct {
  quantity: number;
  pricePerQuantity: number;
  beforeDiscountPrice: number;
  productId: string;
}

export interface CartTotal {
  price: {
    current: number;
    beforeDiscount: number;
  };
  quantity: number;
  products: number;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  products: CartProduct[];
  total: CartTotal;
}

export interface AddToCartRequest {
  id: string;
  quantity: number;
}

export interface UpdateCartRequest {
  id: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  id: string;
}
