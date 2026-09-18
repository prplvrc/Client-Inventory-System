import { useState, type ReactNode } from "react";
import { AuthContext, type User } from "../hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check both localStorage and sessionStorage on initial load
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error(
          "Failed to parse stored user session:",
          error
        );
      }
    }

    return null;
  });

  const login = (
    userData: User,
    token: string,
    rememberMe: boolean
  ) => {
    // Clear any existing authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    // Choose storage based on Remember Me
    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    // Store user and token in the same storage
    storage.setItem(
      "user",
      JSON.stringify(userData)
    );

    storage.setItem("token", token);

    setUser(userData);
  };

  const logout = () => {
    // Remove authentication data from both storages
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

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