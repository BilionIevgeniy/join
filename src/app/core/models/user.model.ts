// ============================================================
//  USER — authenticated user
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  name: string;
  email: string;
  password: string;
}
