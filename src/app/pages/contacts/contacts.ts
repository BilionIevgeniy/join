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
  isModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  modalContact = signal<Contact | null>(null);

  selectContact(contact: Contact): void {
    this.selectedContact.set(contact);
  }

  goBack(): void {
    this.selectedContact.set(null);
  }

  editContact(contact: Contact): void {
    this.modalMode.set('edit');
    this.modalContact.set(contact);
    this.isModalOpen.set(true);
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.modalContact.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalContact.set(null);
  }

  isLoading = this.contactService.isLoading;

  async saveContact(data: { first_name: string; email: string; phone: string }): Promise<void> {
    if (this.modalMode() === 'add') {
      await this.contactService.addContact(data);
    } else if (this.modalContact()?.id) {
      await this.contactService.updateContact(this.modalContact()!.id!, data);
    }
    this.closeModal();
  }

  async deleteContact(id: string): Promise<void> {
    this.selectedContact.set(null);
    await this.contactService.deleteContact(id);
    this.closeModal();
  }

  getLetters(): string[] {
    return Object.keys(this.groupedContacts()).sort();
  }

  getFullName(contact: Contact): string {
    return contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name;
  }
}
