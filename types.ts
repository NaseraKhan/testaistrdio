
export type Page = 'login' | 'register' | 'guide' | 'dashboard';

export interface User {
  username: string;
  email: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
