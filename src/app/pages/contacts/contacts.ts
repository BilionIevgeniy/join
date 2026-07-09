import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '@core/services/contact.service';
import { Contact, ContactMode, CreateContactDto } from '@core/models/contact.model';
import { ModalService } from '@core/services/modal.service';
import { Avatar } from '@shared/avatar/avatar';
import { Button } from '@shared/button/button';
import { ContactModal } from '@components/contact/contact-modal/contact-modal';
import { AuthService } from '@core/services/auth.service';

/** Contacts — page listing all contacts grouped alphabetically, with add/edit/delete via modal. */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, Avatar, Button],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  private contactService = inject(ContactService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  contacts = this.contactService.contacts;
  groupedContacts = this.contactService.groupedContacts;
  selectedContact = signal<Contact | null>(null);
  isLoading = this.contactService.isLoading;

  selectContact(contact: Contact): void {
    this.selectedContact.set(contact);
  }

  goBack(): void {
    this.selectedContact.set(null);
  }

  openEditModal(contact: Contact): void {
    this.openModal('edit', contact);
  }

  openAddModal(): void {
    this.openModal('add', null);
  }

  private openModal(mode: ContactMode, contact: Contact | null): void {
    this.modalService.open(ContactModal, {
      inputs: { mode, contact },
      syncInputs: { isLoading: this.isLoading },
      actions: {
        save: (data: CreateContactDto) => this.saveContact(mode, contact, data),
        delete: (contact: Contact) => this.deleteContact(contact),
        closed: () => this.modalService.close(),
      },
    });
  }

  private async saveContact(
    mode: ContactMode,
    contact: Contact | null,
    data: CreateContactDto,
  ): Promise<void> {
    if (mode === 'add') {
      await this.contactService.addContact(data);
    } else if (contact?.id) {
      await this.contactService.updateContact(contact.id, data);
    }
    this.modalService.close();
  }

  /** Deletes a contact and signs out if the deleted contact was the current user. */
  async deleteContact(contact: Contact): Promise<void> {
    this.selectedContact.set(null);
    const result = await this.contactService.deleteContact(
      contact,
      this.authService.currentUser()?.auth_user_id || '',
    );
    if (result.shouldSignOut) {
      this.authService.signOut();
    }
    this.modalService.close();
  }

  /** Alphabet section headers present in the currently grouped contacts. */
  getLetters(): string[] {
    return Object.keys(this.groupedContacts()).sort();
  }

  getFullName(contact: Contact): string {
    return contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name;
  }
}
