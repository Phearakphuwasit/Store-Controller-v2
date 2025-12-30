import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  public currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUser.next(JSON.parse(user));
    } else {
      // Check for old 'username' key and migrate
      const oldUsername = localStorage.getItem('username');
      if (oldUsername) {
        const migratedUser = { fullName: oldUsername };
        localStorage.setItem('currentUser', JSON.stringify(migratedUser));
        localStorage.removeItem('username');
        this.currentUser.next(migratedUser);
      }
    }
  }

  // ================= LOGIN =================
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.currentUser.next(res.user);
      })
    );
  }

  // ================= REGISTER =================
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.currentUser.next(res.user);
      })
    );
  }

  // ================= LOGOUT =================
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  // ================= UPDATE PROFILE =================
  updateProfile(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': token || '' };
    return this.http.put(`${this.apiUrl}/auth/profile`, data, { headers }).pipe(
      tap((res: any) => {
        if (res.user) {
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          this.currentUser.next(res.user);
        }
      })
    );
  }

  // ================= CHECK LOGIN =================
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
