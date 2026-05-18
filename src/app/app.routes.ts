import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ShopComponent } from './pages/shop/shop';
import { ProductDetail } from './pages/product-detail/product-detail';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { ProfileComponent } from './pages/auth/profile/profile';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:id', component: ProductDetail },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
];
