export type DocumentCategory =
  | 'Identity'
  | 'Visa & Immigration'
  | 'Health'
  | 'Finance'
  | 'Education'
  | 'Employment'
  | 'Insurance'
  | 'Property'
  | 'Vehicle'
  | 'Other';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'No Expiry';

export interface Document {
  id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  issuer: string;           // e.g. "German Immigration Office", "SBI Bank"
  country: string;          // Germany, India, Other
  documentNumber: string;   // passport no, policy no, etc.
  issueDate: string;        // ISO date YYYY-MM-DD
  expiryDate: string;       // ISO date, empty string if no expiry
  reminderDaysBefore: number; // 0 = no reminder, else n days before expiry
  storageLocation: string;  // e.g. "Google Drive > Documents", "Physical - Blue folder"
  notes: string;
  folderId: string | null;
  createdAt: string;
}

export type DocumentFormData = Omit<Document, 'id' | 'userId' | 'createdAt'>;

export interface DocumentFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export type DocumentFolderFormData = Pick<DocumentFolder, 'name'>;
