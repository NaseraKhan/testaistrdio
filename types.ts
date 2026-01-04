
export type Page = 'login' | 'register' | 'guide' | 'dashboard' | 'users';

export interface User {
  id?: number;
  username: string;
  email: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
