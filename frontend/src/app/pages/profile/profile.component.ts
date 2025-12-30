import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  private subscription: Subscription = new Subscription();
  imageTimestamp: number = Date.now();
  private previousProfilePicture: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      console.log('Profile - Current user:', user);
      console.log('Profile - Profile picture:', user?.profilePicture);
      if (user?.profilePicture !== this.previousProfilePicture) {
        this.imageTimestamp = Date.now();
        this.previousProfilePicture = user?.profilePicture || '';
        console.log('Profile - Profile picture changed, new timestamp:', this.imageTimestamp);
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
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('profilePicture', this.selectedFile);

    console.log('Profile - Updating profile with file:', this.selectedFile.name);

    this.authService.updateProfile(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        console.log('Profile - Update response:', res);
        console.log('Profile - Updated user:', res.user);
        alert('Profile picture updated successfully!');
      },
      error: (err) => {
        this.loading = false;
        console.error('Profile - Update error:', err);
        alert('Error updating profile picture');
      },
    });
  }

  getAvatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${this.currentUser?.fullName || 'User'}&background=2563eb&color=fff`;
  }
}
