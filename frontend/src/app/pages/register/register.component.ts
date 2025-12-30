import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroShieldCheck,
  heroUsers,
  heroChartBar,
  heroLockClosed,
  heroUser,
  heroUserCircle,
  heroEnvelope,
  heroAtSymbol,
  heroKey,
  heroEye,
  heroEyeSlash,
  heroCheckCircle,
  heroBriefcase,
  heroUserGroup,
  heroCog,
  heroArrowRight,
  heroArrowPath,
  heroExclamationCircle,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroShieldCheck,
      heroUsers,
      heroChartBar,
      heroLockClosed,
      heroUser,
      heroUserCircle,
      heroEnvelope,
      heroAtSymbol,
      heroKey,
      heroEye,
      heroEyeSlash,
      heroCheckCircle,
      heroBriefcase,
      heroUserGroup,
      heroCog,
      heroArrowRight,
      heroArrowPath,
      heroExclamationCircle,
    }),
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';
  success: string = '';
  showPassword = false;
  loading = false;
  passwordStrength = 'Weak';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // <-- inject AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['staff'],
      terms: [false, Validators.requiredTrue],
    });

    this.registerForm.get('password')?.valueChanges.subscribe((password) => {
      this.calculatePasswordStrength(password);
    });
  }

  get hasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[A-Z]/.test(password);
  }

  get hasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[a-z]/.test(password);
  }

  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 'Weak';
      return;
    }

    const length = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (hasUpper && hasLower) score++;
    if (hasNumbers) score++;
    if (hasSpecial) score++;

    if (score >= 4) this.passwordStrength = 'Strong';
    else if (score >= 2) this.passwordStrength = 'Fair';
    else this.passwordStrength = 'Weak';
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const { fullName, email, password, role } = this.registerForm.value;

    this.authService.register({ fullName, email, password, role }).subscribe({
      next: (res: any) => {
        this.loading = false;
        localStorage.setItem('token', res.token);
        this.authService.currentUser.next(res.user); 
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed';
      },
    });
  }
}
