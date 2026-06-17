/**
 * ContactService — CRUD over Supabase `contacts` table.
 *
 * Supabase query-builder cheatsheet (used in this file):
 *
 *  .from('table')          — select the target table
 *  .select('*')            — SELECT; '*' = all columns; or specify 'id, name'
 *  .insert(payload)        — INSERT a single row or an array of rows
 *  .update(patch)          — UPDATE; always chain .eq() to avoid updating the entire table
 *  .delete()               — DELETE; always chain .eq() to avoid deleting the entire table
 *  .eq('col', value)       — WHERE col = value (row filter)
 *  .select() after mutation — returns the persisted rows (otherwise data is null)
 *  .single()               — unwraps [{...}] → {...}; throws if row count is not exactly 1
 *
 * All methods return Promise<{ data, error }>.
 * If error !== null the request failed and data should not be trusted.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import { Contact, CreateContactDto, UpdateContactDto } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);
  private contactsMap = signal<Record<string, Contact>>({});
  isLoading = signal(false);
  contacts = computed(() => Object.values(this.contactsMap()));
  sortedContacts = computed(() =>
    [...this.contacts()].sort((a, b) => a.first_name.localeCompare(b.first_name)),
  );
  groupedContacts = computed(() => {
    const groups: Record<string, Contact[]> = {};
    this.sortedContacts().forEach((contact) => {
      const letter = contact.first_name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(contact);
    });
    return groups;
  });

  getById(id: string): Contact | undefined {
    return this.contactsMap()[id];
  }

  // ─── CRUD ──────────────────────────────────────────────────────
  async getAll(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.db.from('contacts').select('*');
      if (error) throw error;
      const map: Record<string, Contact> = {};
      data.forEach((c: Contact) => {
        if (c.id) map[c.id] = c;
      });
      this.contactsMap.set(map);
    } catch (err) {
      console.error('getAll contacts failed:', err);
      this.toast.error('Failed to load contacts.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addContact(dto: CreateContactDto): Promise<Contact | null> {
    const payload = {
      ...dto,
      initials: this.generateInitials(dto.first_name),
      color: this.generateAvatarColor(dto.first_name),
    };

    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.db
        .from('contacts')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      this.setOne(data);
      this.toast.success('Contact added successfully.');
      return data;
    } catch (err) {
      console.error('addContact failed:', err);
      this.toast.error('Failed to add contact.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateContact(id: string, dto: UpdateContactDto): Promise<Contact | null> {
    const existing = this.contactsMap()[id];
    if (!existing) return null;

    const patch = {
      ...dto,
      ...(dto.first_name && { initials: this.generateInitials(dto.first_name) }),
    };

    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.db
        .from('contacts')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      this.setOne(data);
      this.toast.success('Contact updated successfully.');
      return data;
    } catch (err) {
      console.error('updateContact failed:', err);
      this.toast.error('Failed to update contact.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    this.isLoading.set(true);
    try {
      const { error } = await this.supabase.db.from('contacts').delete().eq('id', id);
      if (error) throw error;
      this.contactsMap.update((map) => {
        const next = { ...map };
        delete next[id];
        return next;
      });
      this.toast.success('Contact deleted successfully.');
      return true;
    } catch (err) {
      console.error('deleteContact failed:', err);
      this.toast.error('Failed to delete contact.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ─── PRIVATE ───────────────────────────────────────────────────

  private setOne(contact: Contact): void {
    if (!contact.id) return;
    this.contactsMap.update((map) => ({ ...map, [contact.id!]: contact }));
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
}
