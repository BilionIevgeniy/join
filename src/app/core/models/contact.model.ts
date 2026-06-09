// ============================================================
//  CONTACT — contact entity
// ============================================================

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarColor: string;   // hex color of the avatar circle with initials, generated on the frontend
  initials: string;      // "AM" from "Anton Mayer"
}

// ============================================================
//  DTO
// ============================================================

export type CreateContactDto = Omit<Contact, 'id' | 'initials' | 'avatarColor'>;

export type UpdateContactDto = Partial<CreateContactDto>;
