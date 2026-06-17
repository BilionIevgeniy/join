import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Contact } from '../../../core/models/contact.model';
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
  @Input() isLoading: boolean = false;
  @Output() closed = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ first_name: string; email: string; phone: string }>();
  @Output() delete = new EventEmitter<string>();

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
    phone: new FormControl('', [
      Validators.pattern(/^\+?[0-9]+$/),
    ]),
  });

  ngOnInit(): void {
    if (this.mode === 'edit' && this.contact) {
      this.form.setValue({
        name: this.contact.first_name,
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
    if (!this.contact?.id) return;
    this.delete.emit(this.contact.id);
  }

  close(): void {
    this.closed.emit();
  }
}
