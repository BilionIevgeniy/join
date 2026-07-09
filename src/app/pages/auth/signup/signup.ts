import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {
  EMAIL_VALIDATORS,
  NAME_VALIDATORS,
  PASSWORD_VALIDATORS,
  isFieldInvalid,
} from '@core/utils/form.utils';
import { Button } from '@shared/button/button';
import { CheckboxButton } from '@shared/checkbox-button/checkbox-button';
import { BackButton } from '@shared/back-button/back-button';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Button, CheckboxButton, BackButton],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // ─── STATE ────────────────────────────────────────────────
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  acceptedPolicy = signal(false);
  policyTouched = signal(false);

  // ─── FORM ─────────────────────────────────────────────────
  form = this.fb.group(
    {
      first_name: ['', NAME_VALIDATORS],
      last_name: ['', NAME_VALIDATORS],
      email: ['', EMAIL_VALIDATORS],
      password: ['', PASSWORD_VALIDATORS],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  // ─── COMPUTED ─────────────────────────────────────────────
  isLoading = this.authService.isLoading;
  hasPasswordInput = computed(() => !!this.formValue().password);
  hasConfirmPasswordInput = computed(() => !!this.formValue().confirmPassword);

  // ─── PUBLIC API ───────────────────────────────────────────

  isFormValid(): boolean {
    return this.form.valid && this.acceptedPolicy();
  }

  isFieldInvalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  isConfirmPasswordInvalid(): boolean {
    const control = this.form.get('confirmPassword');
    if (!control || !control.touched) return false;
    return control.invalid || this.form.hasError('passwordsMismatch');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  toggleAcceptPolicy(): void {
    this.acceptedPolicy.update((v) => !v);
  }

  onSubmit(): void {
    this.policyTouched.set(true);
    if (this.form.invalid || !this.acceptedPolicy()) {
      this.form.markAllAsTouched();
      return;
    }
    const { first_name, last_name, email, password } = this.form.value;
    this.authService.signUp(first_name!, last_name!, email!, password!);
  }
}
