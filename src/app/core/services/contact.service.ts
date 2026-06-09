import { Injectable, computed, signal } from '@angular/core';
import { Contact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private contactsMap = signal<Record<string, Contact>>({});

  contacts = computed(() => Object.values(this.contactsMap()));

  // Alphabetical sort — for the Contacts page
  sortedContacts = computed(() =>
    [...this.contacts()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  // Grouped by first letter — { A: [...], B: [...] }
  groupedContacts = computed(() => {
    const groups: Record<string, Contact[]> = {};
    this.sortedContacts().forEach((contact) => {
      const letter = contact.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(contact);
    });
    return groups;
  });
}
