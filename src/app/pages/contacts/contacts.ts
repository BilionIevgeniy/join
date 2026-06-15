import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ContactService } from '../../core/services/contact.service';
import { Contact } from '../../core/models/contact.model';
import { Avatar } from '../../components/shared/avatar/avatar';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, Avatar],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
  animations: [
    trigger('slideIn', [
      transition(':leave', []),
      transition('* => *', [
        style({ opacity: 0, transform: 'translateX(60px)' }),
        animate('240ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class Contacts {
  private contactService = inject(ContactService);
  contacts = this.contactService.contacts;
  groupedContacts = this.contactService.groupedContacts;
  selectedContact = signal<Contact | null>(null);

  selectContact(contact: Contact): void {
    this.selectedContact.set(contact);
  }

  goBack(): void {
    this.selectedContact.set(null);
  }

  editContact(contact: Contact): void {
    console.log('edit', contact);
  }

  openAddModal(): void {
    console.log('open add modal');
  }

  deleteContact(id: string): void {
    this.selectedContact.set(null);
    this.contactService.deleteContact(id);
  }

  getLetters(): string[] {
    return Object.keys(this.groupedContacts()).sort();
  }

  getFullName(contact: Contact): string {
    return contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name;
  }
}
