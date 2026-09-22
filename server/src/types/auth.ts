export type UserRole = "administrator" | "manager" | "staff";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

