import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      zipcode: ['', Validators.required],
      avatar: ['https://i.pravatar.cc/150'],
      gender: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    const formValue = this.registerForm.value;

    this.authService
      .signUp({
        firstName: formValue.firstName as string,
        lastName: formValue.lastName as string,
        age: Number(formValue.age),
        email: formValue.email as string,
        password: formValue.password as string,
        address: formValue.address as string,
        phone: formValue.phone as string,
        zipcode: formValue.zipcode as string,
        avatar: formValue.avatar as string,
        gender: formValue.gender as 'MALE' | 'FEMALE',
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.error = err.error?.message || 'შეცდომა მოხდა';
          this.loading = false;
        },
      });
  }
}
