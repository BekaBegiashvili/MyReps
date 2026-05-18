export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  address: string;
  phone: string;
  role: string;
  zipcode: string;
  avatar: string;
  gender: 'MALE' | 'FEMALE';
  cartID: string;
  verified: boolean;
  chatIds: string[];
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  address: string;
  phone: string;
  zipcode: string;
  avatar: string;
  gender: 'MALE' | 'FEMALE';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface UsersResponse {
  total: number;
  limit: number;
  page: number;
  skip: number;
  users: User[];
}

export interface UpdateRequest {
  firstName?: string;
  lastName?: string;
  age?: number;
  address?: string;
  phone?: string;
  zipcode?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE';
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
