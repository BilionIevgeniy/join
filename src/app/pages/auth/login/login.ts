import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { EMAIL_VALIDATORS, PASSWORD_VALIDATORS, isFieldInvalid } from '@core/utils/form.utils';
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
    email: ['', EMAIL_VALIDATORS],
    password: ['', PASSWORD_VALIDATORS],
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
    return isFieldInvalid(this.form, field);
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
