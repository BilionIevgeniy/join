import { Component, effect, inject, Injector, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../core/services/contact.service';
import { Contact, ContactMode, CreateContactDto } from '../../core/models/contact.model';
import { ModalService } from '../../core/services/modal.service';
import { Avatar } from '../../components/shared/avatar/avatar';
import { Button } from '../../components/shared/button/button';
import { ContactModal } from '../../components/contact/contact-modal/contact-modal';

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
  private injector = inject(Injector);
  contacts = this.contactService.contacts;
  groupedContacts = this.contactService.groupedContacts;
  selectedContact = signal<Contact | null>(null);

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
    const ref = this.modalService.open(ContactModal, {
      mode,
      contact,
      isLoading: this.isLoading(),
    });
    ref.instance.save.subscribe((data: CreateContactDto) => this.saveContact(mode, contact, data));
    ref.instance.delete.subscribe((id: string) => this.deleteContact(id));

    const syncLoading = effect(
      () => {
        if (!this.modalService.isOpen()) {
          syncLoading.destroy();
          return;
        }
        ref.setInput('isLoading', this.isLoading());
      },
      { injector: this.injector },
    );
  }

  isLoading = this.contactService.isLoading;

  private async saveContact(
    mode: ContactMode,
    contact: Contact | null,
    data: { first_name: string; email: string; phone: string },
  ): Promise<void> {
    if (mode === 'add') {
      await this.contactService.addContact(data);
    } else if (contact?.id) {
      await this.contactService.updateContact(contact.id, data);
    }
    this.modalService.close();
  }

  async deleteContact(id: string): Promise<void> {
    this.selectedContact.set(null);
    await this.contactService.deleteContact(id);
    this.modalService.close();
  }

  getLetters(): string[] {
    return Object.keys(this.groupedContacts()).sort();
  }

  getFullName(contact: Contact): string {
    return contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name;
  }
}
