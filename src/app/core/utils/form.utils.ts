import { FormGroup, ValidatorFn, Validators } from '@angular/forms';

/**
 * True when the named control exists, has been touched, and is currently invalid.
 * Used by templates to show a field's error state only after the user has interacted with it.
 */
export function isFieldInvalid(form: FormGroup, field: string): boolean {
  const control = form.get(field);
  return !!(control && control.touched && control.invalid);
}

/** Shared validators for an email field — required, and a standard `local@domain.tld` shape. */
export const EMAIL_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/),
];

/** Shared validators for a password field — required, 8+ chars, mixed case, and a symbol. */
export const PASSWORD_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(8),
  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
];

/** Shared validators for a person's name field — required, 2+ chars, letters/space/hyphen only. */
export const NAME_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(2),
  Validators.pattern(/^[a-zA-ZÄÖÜäöüß\s-]+$/),
];
