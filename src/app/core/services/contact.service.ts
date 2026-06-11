import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Contact, CreateContactDto, UpdateContactDto } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase = inject(SupabaseService);

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

  // Get all contacts from Supabase
  async getAll(): Promise<void> {
    const { data, error } = await this.supabase.db.from('contacts').select('*');
    if (error) {
      console.error('Error loading contacts:', error);
      return;
    }
    data.forEach((contact: Contact) => this.upsert(contact));
  }

  // Get contact by ID — used to render avatars on task cards
  getById(id: string): Contact | undefined {
    return this.contactsMap()[id];
  }

  // ─── CRUD (mock — replace with HTTP calls later) ──────────────

  addContact(dto: CreateContactDto): void {
    const contact: Contact = {
      ...dto,
      id: this.generateId(),
      initials: this.generateInitials(dto.name),
      avatarColor: this.generateAvatarColor(dto.name),
    };
    this.upsert(contact);
  }

  updateContact(id: string, dto: UpdateContactDto): void {
    const existing = this.contactsMap()[id];
    if (!existing) return;

    // Recalculate initials if name changed
    const updated: Contact = {
      ...existing,
      ...dto,
      initials: dto.name ? this.generateInitials(dto.name) : existing.initials,
    };
    this.upsert(updated);
  }

  deleteContact(id: string): void {
    this.contactsMap.update((map) => {
      const next = { ...map };
      delete next[id];
      return next;
    });
  }

  // ─── PRIVATE ──────────────────────────────────────────────────

  private upsert(contact: Contact): void {
    this.contactsMap.update((map) => ({ ...map, [contact.id]: contact }));
  }

  private generateInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }

  private generateAvatarColor(name: string): string {
    const colors = [
      '#FF7A00',
      '#FF5EB3',
      '#6E52FF',
      '#9327FF',
      '#00BEE8',
      '#1FD7C1',
      '#FF745E',
      '#FFA35E',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
