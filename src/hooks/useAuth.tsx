import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";
import { mockUser } from "@/lib/mock-data";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  toggleAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  toggleAuth: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (_email: string, _password: string) => {
    setIsLoggedIn(true);
    setUser(mockUser);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const toggleAuth = () => {
    if (isLoggedIn) logout();
    else login(mockUser.email, '');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, toggleAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
