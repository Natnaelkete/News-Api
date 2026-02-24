import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { prisma } from "../config/database";
import { signAccessToken } from "../config/jwt";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

type LoginInput = {
  email: string;
  password: string;
};

const signup = async (
  input: SignupInput,
): Promise<{ user: User; token: string }> => {
  const email = input.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already registered") as Error & {
      status?: number;
      errors?: string[];
    };
    error.status = 409;
    error.errors = ["Email already registered"];
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      role: input.role || "READER",
    },
  });

  const token = signAccessToken(user.id, user.role);

  return { user, token };
};

const login = async (
  input: LoginInput,
): Promise<{ user: User; token: string }> => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error("Invalid credentials") as Error & {
      status?: number;
      errors?: string[];
    };
    error.status = 401;
    error.errors = ["Invalid credentials"];
    throw error;
  }

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) {
    const error = new Error("Invalid credentials") as Error & {
      status?: number;
      errors?: string[];
    };
    error.status = 401;
    error.errors = ["Invalid credentials"];
    throw error;
  }

  const token = signAccessToken(user.id, user.role);
  return { user, token };
};

export { signup, login };
