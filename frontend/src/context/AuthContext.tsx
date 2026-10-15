import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import type { AuthResponse, User } from "../types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // On page load: if a token exists, ask the backend who the user is
  useEffect(() => {
    const token = localStorage.getItem("retain_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("retain_token"))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (data: AuthResponse) => {
    localStorage.setItem("retain_token", data.token);
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/signup", { name, email, password });
    handleAuth(res.data);
  };

  const signin = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/signin", { email, password });
    handleAuth(res.data);
  };

  const signout = () => {
    localStorage.removeItem("retain_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}