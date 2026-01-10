import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../../components/alert/alert.component';

interface UsageStats {
  currentStorage: number;
  totalStorage: number;
  percentage: number;
  nextBillingDate: string;
  planName: string;
}

interface LoginSession {
  _id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  deviceType: 'monitor' | 'phone';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  twoFactorEnabled = false;
  loginSessions: LoginSession[] = [];
  securityLoading = false;
  usageStats: UsageStats = {
    currentStorage: 0,
    totalStorage: 1,
    percentage: 0,
    nextBillingDate: 'Loading...',
    planName: 'Loading...',
  };
  activeTab: 'general' | 'security' | 'notifications' = 'general';
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private cd = inject(ChangeDetectorRef);

  private baseUrl = 'http://16.176.174.48:5000';
  private subscription = new Subscription();

  currentUser: any = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imageTimestamp = Date.now();
  loading = false;

  password = { current: '', new: '', confirm: '' };

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser.subscribe((user) => {
        if (user) {
          this.currentUser = JSON.parse(JSON.stringify(user));
          this.cd.markForCheck();
        }
      })
    );
    this.fetchUsageData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

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
        this.alertService.showAlert(err.error?.message || 'Error updating profile!', 'error');
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

  fetchUsageData(): void {
    // Calling the API endpoint (assuming your backend has /api/user/usage or similar)
    this.authService.getUsageStats().subscribe({
      next: (data: any) => {
        this.usageStats = {
          currentStorage: data.used || 0,
          totalStorage: data.limit || 1,
          percentage: Math.round(((data.used || 0) / (data.limit || 1)) * 100),
          nextBillingDate: data.nextBilling || new Date().toISOString(),
          planName: data.plan || 'Free Tier',
        };
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Usage fetch failed', err);
        // Fallback or silent error so the UI doesn't break
      },
    });
  }

  // --- AUTH ACTIONS ---
  onLogout(): void {
    // Use a modern custom modal or a simple confirm for now
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout(); // Ensure your AuthService has a logout method
    }
  }

  // --- DANGER ZONE ---
  deactivateAccount(): void {
    if (confirm('Are you sure you want to deactivate? You can reactivate within 30 days.')) {
      this.alertService.showAlert('Deactivation request sent.', 'info');
    }
  }

  deleteAccount(): void {
    const confirmName = prompt('To delete your account, please type "DELETE" below:');
    if (confirmName === 'DELETE') {
      // Call your delete API
      this.alertService.showAlert('Account permanently deleted.', 'success');
      this.authService.logout();
    }
  }

  // --- PREFERENCES (Optional Mock Logic) ---
  updatePreference(key: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    // This is where you would call a service to save user settings
    console.log(`Setting ${key} to ${isChecked}`);
    this.alertService.showAlert('Preference updated.', 'success');
  }

  fetchSecurityData(): void {
    // Fetch sessions from your authService
    this.authService.getLoginHistory().subscribe({
      next: (sessions) => {
        this.loginSessions = sessions;
        this.cd.markForCheck();
      },
    });

    // Fetch 2FA Status
    this.authService.getSecuritySettings().subscribe((settings) => {
      this.twoFactorEnabled = settings.twoFactorEnabled;
      this.cd.markForCheck();
    });
  }

  onToggle2FA(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.authService.toggleTwoFactor(isChecked).subscribe({
      next: () => {
        this.twoFactorEnabled = isChecked;
        this.alertService.showAlert(
          `Two-Factor Auth ${isChecked ? 'enabled' : 'disabled'}`,
          'success'
        );
      },
      error: () => {
        this.twoFactorEnabled = !isChecked; // Revert UI on error
        this.alertService.showAlert('Failed to update 2FA settings', 'error');
      },
    });
  }

  onRevokeSession(sessionId: string): void {
    if (confirm('Terminate this session? The device will be logged out immediately.')) {
      this.authService.revokeSession(sessionId).subscribe({
        next: () => {
          this.loginSessions = this.loginSessions.filter((s) => s._id !== sessionId);
          this.alertService.showAlert('Session revoked successfully', 'info');
          this.cd.markForCheck();
        },
      });
    }
  }
}
