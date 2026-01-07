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
  heroPhoto,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

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
      heroPhoto,
    }),
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  loading = false;
  showPassword = false;
  passwordStrength = 'Weak';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['staff'],
      terms: [false, Validators.requiredTrue],
      profilePicture: [null],
    });

    // Calculate password strength when value changes
    this.registerForm.get('password')?.valueChanges.subscribe((password) => {
      this.passwordStrength = this.calculatePasswordStrength(password);
    });
  }

  // ------------------ PASSWORD STRENGTH ------------------
  private calculatePasswordStrength(password: string): string {
    if (!password) return 'Weak';
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score >= 4) return 'Strong';
    if (score >= 2) return 'Fair';
    return 'Weak';
  }

  get f() {
    return this.registerForm.controls;
  }

  // ------------------ FILE HANDLING ------------------
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.registerForm.patchValue({ profilePicture: file });

    const reader = new FileReader();
    reader.onload = (e) => (this.previewUrl = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.registerForm.patchValue({ profilePicture: null });
  }

  // ------------------ REGISTER ------------------
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { fullName, email, password, role } = this.registerForm.value;

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    if (this.selectedFile) formData.append('profilePicture', this.selectedFile);

    // ------------------ GET USER LOCATION ------------------
    try {
      const coords = await this.getUserLocation();
      formData.append('lat', coords.lat.toString());
      formData.append('lng', coords.lng.toString());
    } catch (err) {
      console.warn('Location not available, skipping:', err);
      formData.append('lat', '0');
      formData.append('lng', '0');
    }

    // ------------------ CALL REGISTER API ------------------
    this.authService.register(formData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.authService.setCurrentUser(res.user);
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.error = err?.error?.message || 'Registration failed. Please try again.';
        },
      });
  }

  private getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: 0, lng: 0 });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 }),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }
}
