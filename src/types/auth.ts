export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}
