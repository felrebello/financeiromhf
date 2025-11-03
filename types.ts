export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export type User = 'Fellipe' | 'Mhariana';
export type ViewUser = 'Ambos' | User;
export type ActiveView = 'Dashboard' | 'Relatórios' | 'Categorias' | 'Perfil' | 'Análise';

export interface Category {
  id: string;
  name: string;
}

export interface Categories {
  income: Category[];
  expense: Category[];
}

export interface Transaction {
  id: string;
  user: User;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  tags: string[];
  date: string;
}

export interface AnalyzedExpense {
  amount: number;
  category: string;
  description: string;
  tags: string[];
}

export interface ParsedTransaction {
  // Temporary id for list rendering
  tempId: string;
  user: User;
  type: TransactionType.EXPENSE;
  category: string;
  description: string;
  amount: number;
  tags: string[];
  date: string;
}
