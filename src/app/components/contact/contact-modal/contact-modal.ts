import { Component, input, output, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Contact, ContactMode, CreateContactDto } from '../../../core/models/contact.model';
import { Avatar } from '../../shared/avatar/avatar';
import { Button } from '../../shared/button/button';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [ReactiveFormsModule, Avatar, Button],
  templateUrl: './contact-modal.html',
  styleUrl: './contact-modal.scss',
})
export class ContactModal implements OnInit {
  mode = input<ContactMode>('add');
  contact = input<Contact | null>(null);
  isLoading = input<boolean>(false);
  closed = output<void>();
  save = output<CreateContactDto>();
  delete = output<string>();

  isClosing = signal(false);

  form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-zA-ZÄÖÜäöüß\s\-]+$/),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/),
    ]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\+?[0-9]+$/)]),
  });

  ngOnInit(): void {
    const contact = this.contact();
    if (this.mode() === 'edit' && contact) {
      this.form.setValue({
        name: contact.first_name,
        email: contact.email,
        phone: contact.phone ?? '',
      });
    }
  }

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
      first_name: (this.getField('name').value ?? '').trim(),
      email: this.getField('email').value ?? '',
      phone: this.getField('phone').value ?? '',
    });
  }

  onDelete(): void {
    const contact = this.contact();
    if (!contact?.id) return;
    this.delete.emit(contact.id);
  }

  close(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isClosing.set(false);
      this.closed.emit();
    }, 300);
  }
}
