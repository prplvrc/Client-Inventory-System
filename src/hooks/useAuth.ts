import { createContext, useContext } from "react";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: "ADMIN" | "STAFF";

  branch: {
    id: number;
    code: "BRANCH_1" | "BRANCH_2";
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, rememberMe: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}