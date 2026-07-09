import { Component, input, output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Contact, ContactMode, CreateContactDto } from '@core/models/contact.model';
import { EMAIL_VALIDATORS, NAME_VALIDATORS } from '@core/utils/form.utils';
import { Avatar } from '@shared/avatar/avatar';
import { Button } from '@shared/button/button';

/** ContactModal — create/edit form for a contact, opened via the app-wide modal service. */
@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [ReactiveFormsModule, Avatar, Button],
  templateUrl: './contact-modal.html',
  styleUrl: './contact-modal.scss',
})
export class ContactModal implements OnInit {
  // ─── INPUTS ───────────────────────────────────────────────
  mode = input<ContactMode>('add');
  contact = input<Contact | null>(null);
  isLoading = input<boolean>(false);

  // ─── OUTPUTS ──────────────────────────────────────────────
  save = output<CreateContactDto>();
  delete = output<Contact>();
  closed = output<void>();

  // ─── FORM ─────────────────────────────────────────────────
  form = new FormGroup({
    first_name: new FormControl('', NAME_VALIDATORS),
    last_name: new FormControl('', NAME_VALIDATORS),
    email: new FormControl('', EMAIL_VALIDATORS),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\+?[0-9\s]+$/)]),
  });

  // ─── LIFECYCLE ────────────────────────────────────────────

  ngOnInit(): void {
    const contact = this.contact();
    if (this.mode() === 'edit' && contact) {
      this.form.setValue({
        first_name: contact.first_name,
        last_name: contact.last_name ?? '',
        email: contact.email,
        phone: contact.phone ?? '',
      });
    }
  }

  // ─── PUBLIC API ───────────────────────────────────────────

  getField(name: string) {
    return this.form.get(name)!;
  }

  getInitials(): string {
    return this.mode() === 'edit' ? (this.contact()?.initials ?? '') : '';
  }

  getAvatarColor(): string {
    return this.contact()?.color ?? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit({
      first_name: (this.getField('first_name').value ?? '').trim(),
      last_name: (this.getField('last_name').value ?? '').trim(),
      email: this.getField('email').value ?? '',
      phone: (this.getField('phone').value ?? '').trim(),
    });
  }

  onDelete(): void {
    const contact = this.contact();
    if (!contact?.id) return;
    this.delete.emit(contact);
  }

  close(): void {
    this.closed.emit();
  }
}
