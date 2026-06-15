// ============================================================
//  CONTACT — contact entity
// ============================================================

export interface Contact {
  id?: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  color: string; // hex color of the avatar circle with initials, generated on the frontend
  initials: string; // "AM" from "Anton Mayer"
}

// ============================================================
//  DTO
// ============================================================

export type CreateContactDto = Omit<Contact, 'id' | 'initials' | 'color'>;

export type UpdateContactDto = Partial<CreateContactDto>;
