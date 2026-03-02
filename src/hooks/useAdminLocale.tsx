import { createContext, useContext, useState, ReactNode } from "react";

type AdminLocale = "pt" | "es";

interface AdminLocaleContextType {
  adminLocale: AdminLocale;
  setAdminLocale: (locale: AdminLocale) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextType>({
  adminLocale: "pt",
  setAdminLocale: () => {},
});

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [adminLocale, setAdminLocale] = useState<AdminLocale>("pt");

  return (
    <AdminLocaleContext.Provider value={{ adminLocale, setAdminLocale }}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}
