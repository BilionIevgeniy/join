import { Component, Input, OnInit, inject } from '@angular/core';
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

  contactService = inject(ContactService);

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

  getField(name: string) { return this.form.get(name)!; }

  getInitials(): string {
    return this.mode === 'edit' ? this.contact?.initials ?? '' : '';
  }

  getAvatarColor(): string {
    return this.contact?.color ?? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const first_name = (this.getField('name').value ?? '').trim();

    try {
      if (this.mode === 'add') {
        await this.contactService.addContact({
          first_name,
          email: this.getField('email').value ?? '',
          phone: this.getField('phone').value ?? '',
        });
      } else if (this.contact?.id) {
        await this.contactService.updateContact(this.contact.id, {
          first_name,
          email: this.getField('email').value ?? '',
          phone: this.getField('phone').value ?? '',
        });
      }
      this.close();
    } catch (err) {
      console.error(err);
    }
  }

  async onDelete(): Promise<void> {
    if (!this.contact?.id) return;
    try {
      await this.contactService.deleteContact(this.contact.id);
      this.close();
    } catch (err) {
      console.error(err);
    }
  }

  close(): void {
    this.contactService.closeModal();
  }
}
