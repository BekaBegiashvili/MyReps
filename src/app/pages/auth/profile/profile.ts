import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: User | null = null;
  error = '';
  success = '';
  activeTab: 'info' | 'edit' | 'password' = 'info';

  editForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl<number>(0, Validators.required),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    zipcode: new FormControl('', Validators.required),
  });

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.editForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          address: user.address,
          phone: user.phone,
          zipcode: user.zipcode,
        });
      } else {
        this.authService.getMe().subscribe(u => {
          this.user = u;
          this.editForm.patchValue({
            firstName: u.firstName,
            lastName: u.lastName,
            age: u.age,
            address: u.address,
            phone: u.phone,
            zipcode: u.zipcode,
          });
        });
      }
    });
  }

  onUpdate() {
    if (this.editForm.invalid) return;
    this.error = '';
    this.success = '';
    this.authService.updateProfile(this.editForm.value as any).subscribe({
      next: () => {
        this.success = 'პროფილი წარმატებით განახლდა!';
        this.activeTab = 'info';
      },
      error: () => this.error = 'შეცდომა მოხდა!',
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.error = '';
    this.success = '';
    this.authService.changePassword(this.passwordForm.value as any).subscribe({
      next: () => {
        this.success = 'პაროლი წარმატებით შეიცვალა!';
        this.passwordForm.reset();
      },
      error: () => this.error = 'ძველი პაროლი არასწორია!',
    });
  }

  onDelete() {
    if (!confirm('დარწმუნებული ხარ რომ გინდა ანგარიშის წაშლა?')) return;
    this.authService.deleteAccount().subscribe({
      next: () => this.router.navigate(['/auth/register']),
      error: () => this.error = 'შეცდომა მოხდა!',
    });
  }

  onSignOut() {
    this.authService.signOut().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        localStorage.clear();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}