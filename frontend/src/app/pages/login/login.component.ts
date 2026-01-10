import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.error = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password, rememberMe } = this.loginForm.value;

    // Call login from AuthService
    this.authService.login({ email, password })
      .pipe(finalize(() => (this.loading = false))) // automatically stop loading
      .subscribe({
        next: (res: any) => {
          // ✅ Save token and user in AuthService (centralized)
          this.authService.setToken(res.token, rememberMe); 
          this.authService.setCurrentUser(res.user);

          // Navigate to dashboard
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Login error:', err);

          // Friendly error message
          if (err.error?.message) this.error = err.error.message;
          else if (err.message) this.error = err.message;
          else this.error = 'Login failed. Please check your credentials.';
        },
      });
  }
}
