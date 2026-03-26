// ─── Session ─────────────────────────────────────────────────────────────────

export interface UserSession {
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      phone?: string;
    };
  };
  name?: string;
  phone?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}
