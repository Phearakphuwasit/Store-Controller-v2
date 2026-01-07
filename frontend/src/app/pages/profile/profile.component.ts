import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private cd = inject(ChangeDetectorRef);

  private baseUrl = 'http://localhost:5000'; // Change to your backend URL
  private subscription = new Subscription();

  currentUser: any = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imageTimestamp = Date.now();
  loading = false;

  password = { current: '', new: '', confirm: '' };

  ngOnInit(): void {
    // Subscribe to currentUser from AuthService
    this.subscription.add(
      this.authService.currentUser.subscribe((user) => {
        if (user) {
          // Deep clone to prevent direct mutation
          this.currentUser = JSON.parse(JSON.stringify(user));
          this.cd.markForCheck();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // --- AVATAR & FILE HANDLING ---
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.alertService.showAlert('Image is too large. Max 2MB.', 'warning');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
      this.cd.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  getAvatarUrl(): string {
    if (this.previewUrl) return this.previewUrl;

    if (this.currentUser?.profilePicture) {
      const pic = this.currentUser.profilePicture;
      const fullPath = pic.startsWith('http') ? pic : `${this.baseUrl}/${pic}`;
      return `${fullPath}?t=${this.imageTimestamp}`;
    }

    // Default avatar if no profile picture
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.currentUser?.fullName || 'User'
    )}&background=6366f1&color=fff&size=128`;
  }

  // --- PROFILE UPDATE ---
  updateProfile(): void {
    if (!this.currentUser) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('fullName', this.currentUser.fullName || '');
    formData.append('phone', this.currentUser.phone || '');
    formData.append('address', this.currentUser.address || '');

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.imageTimestamp = Date.now();

        this.alertService.showAlert('Profile updated successfully!', 'success');

        if (res.user) {
          this.authService.currentUser.next(res.user);
        }

        this.cd.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert(
          err.error?.message || 'Error updating profile!',
          'error'
        );
        this.cd.markForCheck();
      },
    });
  }

  // --- PASSWORD UPDATE ---
  updatePassword(): void {
    if (this.password.new !== this.password.confirm) {
      this.alertService.showAlert('New passwords do not match.', 'error');
      return;
    }

    this.authService.updatePassword(this.password.current, this.password.new).subscribe({
      next: () => {
        this.alertService.showAlert('Password updated successfully!', 'success');
        this.password = { current: '', new: '', confirm: '' };
        this.cd.markForCheck();
      },
      error: (err) => {
        this.alertService.showAlert(
          err.error?.message || 'Current password is incorrect.',
          'error'
        );
        this.cd.markForCheck();
      },
    });
  }
}
