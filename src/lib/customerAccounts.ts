export interface CustomerAccount {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export const AUTH_STORAGE_KEYS = {
  user: "auth_user",
  customers: "customer_accounts",
} as const;

export const CUSTOMER_ACCOUNTS_UPDATED_EVENT = "customer-accounts-updated";

export const ADMIN_CREDENTIALS = {
  email: "admin@imkcargo.com",
  password: "admin123",
} as const;

export const DEFAULT_CUSTOMER_ACCOUNTS: CustomerAccount[] = [
  {
    name: "Ayaan Ali",
    email: "customer@imkcargo.com",
    password: "customer123",
    createdAt: "2026-02-01T08:00:00.000Z",
  },
  {
    name: "New Customer",
    email: "new.customer@example.com",
    password: "newcustomer123",
    createdAt: "2026-02-13T07:00:00.000Z",
  },
];

export const normalizeEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();
  const [localPart, domainPart] = normalized.split("@");
  if (!localPart || !domainPart) {
    return normalized;
  }
  if (domainPart.startsWith("imk") && domainPart.endsWith(".com") && domainPart !== "imkcargo.com") {
    return `${localPart}@imkcargo.com`;
  }
  return normalized;
};

const isValidCustomerAccount = (customer: unknown): customer is CustomerAccount => {
  const candidate = customer as CustomerAccount | null;
  return (
    typeof candidate?.name === "string" &&
    typeof candidate?.email === "string" &&
    typeof candidate?.password === "string" &&
    typeof candidate?.createdAt === "string"
  );
};

export function loadCustomerAccounts(): CustomerAccount[] {
  const storedCustomers = localStorage.getItem(AUTH_STORAGE_KEYS.customers);
  if (!storedCustomers) {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.customers,
      JSON.stringify(DEFAULT_CUSTOMER_ACCOUNTS)
    );
    return DEFAULT_CUSTOMER_ACCOUNTS;
  }

  try {
    const parsed = JSON.parse(storedCustomers);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid customer data shape.");
    }

    const validCustomers = parsed.filter(isValidCustomerAccount);
    if (validCustomers.length === 0) {
      localStorage.setItem(
        AUTH_STORAGE_KEYS.customers,
        JSON.stringify(DEFAULT_CUSTOMER_ACCOUNTS)
      );
      return DEFAULT_CUSTOMER_ACCOUNTS;
    }

    const normalizedCustomers = validCustomers.map((customer) => ({
      ...customer,
      email: normalizeEmail(customer.email),
    }));

    const dedupedCustomers = Array.from(
      new Map(
        normalizedCustomers.map((customer) => [normalizeEmail(customer.email), customer])
      ).values()
    );

    const existingEmails = new Set(dedupedCustomers.map((customer) => normalizeEmail(customer.email)));
    const missingDefaults = DEFAULT_CUSTOMER_ACCOUNTS.filter(
      (customer) => !existingEmails.has(normalizeEmail(customer.email))
    );
    const mergedCustomers = [...dedupedCustomers, ...missingDefaults];

    if (missingDefaults.length > 0) {
      localStorage.setItem(AUTH_STORAGE_KEYS.customers, JSON.stringify(mergedCustomers));
    }

    return mergedCustomers;
  } catch (error) {
    console.error("Failed to parse stored customers:", error);
    localStorage.setItem(AUTH_STORAGE_KEYS.customers, JSON.stringify(DEFAULT_CUSTOMER_ACCOUNTS));
    return DEFAULT_CUSTOMER_ACCOUNTS;
  }
}

export function saveCustomerAccounts(accounts: CustomerAccount[]) {
  localStorage.setItem(AUTH_STORAGE_KEYS.customers, JSON.stringify(accounts));
  window.dispatchEvent(new Event(CUSTOMER_ACCOUNTS_UPDATED_EVENT));
}
