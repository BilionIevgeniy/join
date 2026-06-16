import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Contact } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
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
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() contact: Contact | null = null;
  @Output() closed = new EventEmitter<void>();

  private contactService = inject(ContactService);

  isLoading = false;

  form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(/^[a-zA-ZÄÖÜäöüß\s]+$/),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/),
    ]),
    phone: new FormControl('', [
      Validators.pattern(/^\+?[0-9]+$/),
    ]),
  });

  ngOnInit(): void {
    if (this.mode === 'edit' && this.contact) {
      const fullName = this.contact.last_name
        ? `${this.contact.first_name} ${this.contact.last_name}`
        : this.contact.first_name;
      this.form.setValue({
        name: fullName,
        email: this.contact.email,
        phone: this.contact.phone ?? '',
      });
    }
  }

  get nameControl() { return this.form.get('name')!; }
  get emailControl() { return this.form.get('email')!; }
  get phoneControl() { return this.form.get('phone')!; }

  getInitials(): string {
    const name = this.nameControl.value?.trim() ?? '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(): string {
    return this.contact?.color ?? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const parts = (this.nameControl.value ?? '').trim().split(' ').filter(Boolean);
    const first_name = parts[0] ?? '';
    const last_name = parts.slice(1).join(' ') || undefined;

    try {
      if (this.mode === 'add') {
        await this.contactService.addContact({
          first_name,
          last_name,
          email: this.emailControl.value ?? '',
          phone: this.phoneControl.value ?? '',
        });
      } else if (this.contact?.id) {
        await this.contactService.updateContact(this.contact.id, {
          first_name,
          last_name,
          email: this.emailControl.value ?? '',
          phone: this.phoneControl.value ?? '',
        });
      }
      this.closed.emit();
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  async onDelete(): Promise<void> {
    if (!this.contact?.id) return;
    this.isLoading = true;
    try {
      await this.contactService.deleteContact(this.contact.id);
      this.closed.emit();
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  close(): void {
    this.closed.emit();
  }
}
