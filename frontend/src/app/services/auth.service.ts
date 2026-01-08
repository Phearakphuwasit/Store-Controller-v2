import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://16.176.174.48:5000/api';
  private tokenKey = 'token';
  private userKey = 'currentUser';

  public currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Load user from localStorage
    const user = localStorage.getItem(this.userKey);
    if (user) {
      this.currentUser.next(JSON.parse(user));
    } else {
      const oldUsername = localStorage.getItem('username');
      if (oldUsername) {
        const migratedUser = { fullName: oldUsername };
        localStorage.setItem(this.userKey, JSON.stringify(migratedUser));
        localStorage.removeItem('username');
        this.currentUser.next(migratedUser);
      }
    }
  }

  // -------------------- TOKEN MANAGEMENT --------------------
  setToken(token: string, rememberMe = true) {
    if (rememberMe) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  // -------------------- AUTH API --------------------
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data).pipe(
      tap((res: any) => {
        this.setToken(res.token);
        this.setCurrentUser(res.user);
      }),
      catchError(this.handleError)
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data).pipe(
      tap((res: any) => {
        this.setToken(res.token);
        this.setCurrentUser(res.user);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.removeToken();
    localStorage.removeItem(this.userKey);
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  // -------------------- CURRENT USER --------------------
  setCurrentUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.next(user);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // -------------------- PROFILE --------------------
  getProfile(token?: string): Observable<any> {
    const authToken = token || this.getToken();
    return this.http
      .get<any>(`${this.baseUrl}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .pipe(
        map((res) => res.user),
        catchError(this.handleError)
      );
  }

  updateProfile(data: any): Observable<any> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return this.http
      .put(`${this.baseUrl}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      })
      .pipe(
        tap((res: any) => {
          if (res.user) this.setCurrentUser(res.user);
        }),
        catchError(this.handleError)
      );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http
      .put(
        `${this.baseUrl}/auth/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${this.getToken()}` } }
      )
      .pipe(catchError(this.handleError));
  }

  updateLocation(lat: number, lng: number, city: string, country: string): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/auth/update-location`,
        { lat, lng, city, country },
        { headers: { Authorization: `Bearer ${this.getToken()}` } }
      )
      .pipe(catchError(this.handleError));
  }

  // -------------------- ERROR HANDLER --------------------
  private handleError(error: HttpErrorResponse) {
    console.error('AuthService Error:', error);
    let msg = 'An unknown error occurred';
    if (error.error && error.error.message) msg = error.error.message;
    else if (error.message) msg = error.message;
    return throwError(() => new Error(msg));
  }
}
