import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@shared/button/button';
import { CheckboxButton } from '@shared/checkbox-button/checkbox-button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Button, CheckboxButton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);

  isLoading = signal(false);
  rememberMe = signal(false);
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

  // Plain method (not computed): form.valid is not a signal, so a computed
  // would cache the first value and never update. A method re-evaluates on
  // every change detection cycle.
  isFormValid(): boolean {
    return this.form.valid;
  }

  // Bridges valueChanges into a signal so the template can reactively show
  // the eye icon only once the user has typed something into the password field.
  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  hasPasswordInput = computed(() => !!this.formValue().password);

  toggleRememberMe(): void {
    this.rememberMe.update((v) => !v);
  }

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
    console.log('Login:', this.form.value, 'rememberMe:', this.rememberMe());
  }

  onGuestLogin(): void {
    console.log('Guest login');
  }
}
