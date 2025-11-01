export type User = 'Eu' | 'Esposa';
export type TransactionType = 'income' | 'expense';
export type View = 'dashboard' | 'reports' | 'categories' | 'profile' | 'scanReceipt';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  uid: string; // Firebase user ID
  userName: User; // Display name
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  createdAt: string; // Keep as ISO string for simplicity, will convert Firestore timestamp
  tags: string[];
}

export interface AuthUser {
  uid: string;
  email: string;
  name: User;
}

export interface ScannedReceiptData {
  amount: number;
  description: string;
  date: string;
}
