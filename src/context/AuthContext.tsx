import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ADMIN_CREDENTIALS,
  AUTH_STORAGE_KEYS,
  CUSTOMER_ACCOUNTS_UPDATED_EVENT,
  loadCustomerAccounts,
  normalizeEmail,
  saveCustomerAccounts,
  type CustomerAccount,
} from "@/lib/customerAccounts";

type UserRole = "admin" | "customer";

interface User {
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  registerCustomer: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);

  useEffect(() => {
    const loadedCustomers = loadCustomerAccounts();
    setCustomers(loadedCustomers);

    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as Partial<User> & { role?: string };
        const normalizedRole = parsedUser.role === "user" ? "customer" : parsedUser.role;

        if (
          typeof parsedUser.email === "string" &&
          (normalizedRole === "admin" || normalizedRole === "customer")
        ) {
          setUser({
            email: normalizeEmail(parsedUser.email),
            role: normalizedRole,
            name: typeof parsedUser.name === "string" ? parsedUser.name : undefined,
          });
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEYS.user);
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(AUTH_STORAGE_KEYS.user);
      }
    }
  }, []);

  useEffect(() => {
    const syncCustomers = () => {
      setCustomers(loadCustomerAccounts());
    };

    window.addEventListener(CUSTOMER_ACCOUNTS_UPDATED_EVENT, syncCustomers);
    window.addEventListener("storage", syncCustomers);
    return () => {
      window.removeEventListener(CUSTOMER_ACCOUNTS_UPDATED_EVENT, syncCustomers);
      window.removeEventListener("storage", syncCustomers);
    };
  }, []);

  const login = (email: string, password: string): boolean => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedAdminEmail = normalizeEmail(ADMIN_CREDENTIALS.email);

    if (normalizedEmail === normalizedAdminEmail && password === ADMIN_CREDENTIALS.password) {
      const newUser: User = { email: normalizedAdminEmail, role: "admin" };
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(newUser));
      return true;
    }

    const matchedCustomer = customers.find((customer) => {
      return normalizeEmail(customer.email) === normalizedEmail && customer.password === password;
    });

    if (matchedCustomer) {
      const newUser: User = {
        email: normalizeEmail(matchedCustomer.email),
        role: "customer",
        name: matchedCustomer.name,
      };
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(newUser));
      return true;
    }

    return false;
  };

  const registerCustomer = (name: string, email: string, password: string) => {
    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedAdminEmail = normalizeEmail(ADMIN_CREDENTIALS.email);

    if (!normalizedName || !normalizedEmail || !password.trim()) {
      return {
        success: false,
        message: "Name, email, and password are required.",
      };
    }

    if (password.trim().length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters long.",
      };
    }

    if (normalizedEmail === normalizedAdminEmail) {
      return {
        success: false,
        message: "This email is reserved for admin access.",
      };
    }

    const emailAlreadyInUse = customers.some(
      (customer) => normalizeEmail(customer.email) === normalizedEmail
    );
    if (emailAlreadyInUse) {
      return {
        success: false,
        message: "A customer with this email already exists.",
      };
    }

    const newCustomer: CustomerAccount = {
      name: normalizedName,
      email: normalizedEmail,
      password: password.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextCustomers = [...customers, newCustomer];
    setCustomers(nextCustomers);
    saveCustomerAccounts(nextCustomers);

    const newUser: User = {
      name: newCustomer.name,
      email: newCustomer.email,
      role: "customer",
    };

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(newUser));

    return {
      success: true,
      message: "Customer account created successfully.",
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  };

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  return (
    <AuthContext.Provider value={{ user, login, registerCustomer, logout, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
