import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  error = '';
  showRecovery = false;
  recoveryEmail = '';
  success = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    
  ) {}

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onRecovery() {
    if (!this.recoveryEmail) return;
    this.authService.recovery(this.recoveryEmail).subscribe({
      next: () => {
        this.success = 'პაროლის აღდგენის ინსტრუქცია გაიგზავნა მეილზე!';
        this.recoveryEmail = '';
      },
      error: () => (this.error = 'ეს ელ-ფოსტა დარეგისტრირებული არ არის!'),
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService
        .signIn({
          email: email as string,
          password: password as string,
        })
        .subscribe({
          next: (response) => {
            localStorage.setItem('access_token', response.access_token);

            this.authService.getMe().subscribe((user) => {
              if (!user.verified) {
                this.error = 'გთხოვთ დაადასტუროთ ელ-ფოსტა შესვლამდე!';
                localStorage.removeItem('access_token');
                return;
              }
              this.router.navigate(['/']);
            });
          },
          error: (err) => {
            this.error = 'არასწორი ელ-ფოსტა ან პაროლი';
            console.error(err);
          },
        });
    }
  }
}
