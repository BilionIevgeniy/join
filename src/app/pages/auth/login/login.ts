import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { EMAIL_VALIDATORS, PASSWORD_VALIDATORS, isFieldInvalid } from '@core/utils/form.utils';
import { Button } from '@shared/button/button';

/** Login — email/password sign-in form, plus a no-credentials guest login. */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // ─── STATE ────────────────────────────────────────────────
  showPassword = signal(false);

  // ─── FORM ─────────────────────────────────────────────────
  form = this.fb.group({
    email: ['', EMAIL_VALIDATORS],
    password: ['', PASSWORD_VALIDATORS],
  });

  /** Bridges the form's RxJS `valueChanges` into a signal so it can be read inside `computed()`. */
  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  // ─── COMPUTED ─────────────────────────────────────────────
  isLoading = this.authService.isLoading;
  hasPasswordInput = computed(() => !!this.formValue().password);

  // ─── PUBLIC API ───────────────────────────────────────────

  isFormValid(): boolean {
    return this.form.valid;
  }

  isFieldInvalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
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
