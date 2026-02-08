export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}
