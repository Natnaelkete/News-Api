import type { Role } from "@prisma/client";

type AuthUser = {
  id: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export type { AuthUser };
export {};
