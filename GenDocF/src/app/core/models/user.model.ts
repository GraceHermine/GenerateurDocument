export interface User {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  refresh: string;
  access: string;
  user: User;
}
