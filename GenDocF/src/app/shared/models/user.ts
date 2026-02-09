export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // optionnel pour créer un utilisateur
}
