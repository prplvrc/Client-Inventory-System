import { useState, type ReactNode } from "react";
import { AuthContext, type User, } from "../hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check both localStorage and sessionStorage on initial load
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user session:", error);
      }
    }
    return null;
  });

  const login = (userData: User, rememberMe: boolean) => {
    // Clear existing storage to avoid duplicate states
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    if (rememberMe) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("user", JSON.stringify(userData));
    }

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}