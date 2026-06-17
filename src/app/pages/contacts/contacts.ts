import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../core/services/contact.service';
import { Contact } from '../../core/models/contact.model';
import { Avatar } from '../../components/shared/avatar/avatar';
import { Button } from '../../components/shared/button/button';
import { ContactModal } from '../../components/contact/contact-modal/contact-modal';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, Avatar, Button, ContactModal],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  private contactService = inject(ContactService);
  contacts = this.contactService.contacts;
  groupedContacts = this.contactService.groupedContacts;
  selectedContact = signal<Contact | null>(null);
  isModalOpen = this.contactService.isModalOpen;
  modalMode = this.contactService.modalMode;
  modalContact = this.contactService.modalContact;

  selectContact(contact: Contact): void {
    this.selectedContact.set(contact);
  }

  goBack(): void {
    this.selectedContact.set(null);
  }

  editContact(contact: Contact): void {
    this.contactService.openModal('edit', contact);
  }

  openAddModal(): void {
    this.contactService.openModal('add');
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
