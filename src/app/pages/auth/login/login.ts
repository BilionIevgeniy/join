import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { Button } from '@shared/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = this.authService.isLoading;
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
      ],
    ],
  });

  isFormValid(): boolean {
    return this.form.valid;
  }

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  hasPasswordInput = computed(() => !!this.formValue().password);

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.touched && control.invalid);
  }

  onLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    this.authService.signIn(email!, password!);
  }

  onGuestLogin(): void {
    this.authService.signInAsGuest();
  }
}
