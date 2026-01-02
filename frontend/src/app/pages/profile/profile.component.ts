import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: any = {
    fullName: '',
    email: '',
    role: '',
    profilePicture: '',
    phone: '',
    address: '',
    notifications: true,
    lastLogin: '',
    twoFA: false,
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  imageTimestamp: number = Date.now();

  password = { current: '', new: '', confirm: '' };

  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.currentUser = { ...user };
        this.imageTimestamp = Date.now();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'success';

  updateProfile(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('profilePicture', this.selectedFile);

    this.authService.updateProfile(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.alertType = 'success';
        this.alertMessage = 'Profile updated successfully!';
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.alertType = 'error';
        this.alertMessage = 'Error updating profile!';
      },
    });
  }

  updatePassword(): void {
    if (!this.password.current || !this.password.new || !this.password.confirm) {
      alert('Fill all password fields.');
      return;
    }
    if (this.password.new !== this.password.confirm) {
      alert('New password and confirm password do not match.');
      return;
    }

    this.authService.updatePassword(this.password.current, this.password.new).subscribe({
      next: () => {
        alert('Password updated successfully!');
        this.password = { current: '', new: '', confirm: '' };
      },
      error: (err) => {
        console.error(err);
        alert('Password update failed.');
      },
    });
  }

  getAvatarUrl(): string {
    return this.currentUser?.profilePicture
      ? `${this.currentUser.profilePicture}?t=${this.imageTimestamp}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          this.currentUser?.fullName || 'User'
        )}&background=2563eb&color=fff`;
  }
}
