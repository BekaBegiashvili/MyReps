import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  User,
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  UsersResponse,
  UpdateRequest,
  ChangePasswordRequest,
} from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'https://api.everrest.educata.dev/auth';

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);

    this.getMe().subscribe((user) => {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    });
  }

  private clearSession(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  getMe(): Observable<User> {
    return this.http.get<User>(this.API);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API}/id/${id}`);
  }

  getAllUsers(pageIndex: number = 1, pageSize: number = 10): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.API}/all`, {
      params: { page_index: pageIndex, page_size: pageSize },
    });
  }

  signUp(data: SignUpRequest): Observable<User> {
    return this.http.post<User>(`${this.API}/sign_up`, data).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
    );
  }

  signIn(data: SignInRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/sign_in`, data)
      .pipe(tap((res) => this.saveSession(res)));
  }

  signOut(): Observable<any> {
    return this.http.post(`${this.API}/sign_out`, {}).pipe(tap(() => this.clearSession()));
  }

  refreshToken(): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(`${this.API}/refresh`, {})
      .pipe(tap((res) => localStorage.setItem('access_token', res.access_token)));
  }

  verifyEmail(email: string): Observable<any> {
    return this.http.post(`${this.API}/verify_email`, { email });
  }

  recovery(email: string): Observable<any> {
    return this.http.post(`${this.API}/recovery`, { email });
  }

  updateProfile(data: UpdateRequest): Observable<User> {
    return this.http.patch<User>(`${this.API}/update`, data).pipe(
      tap((updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.patch(`${this.API}/change_password`, data);
  }

  deleteAccount(): Observable<{ acknowledged: boolean }> {
    return this.http
      .delete<{ acknowledged: boolean }>(`${this.API}/delete`)
      .pipe(tap(() => this.clearSession()));
  }
}
