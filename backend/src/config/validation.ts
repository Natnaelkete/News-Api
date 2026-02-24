import { z } from "zod";
import { NAME_REGEX, PASSWORD_REGEX } from "../utils/constants";

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(NAME_REGEX, "Name must contain letters and valid separators only"),
  email: z.string().email("Email must be valid"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be 8+ chars with upper, lower, number, and special",
    ),
  role: z.enum(["AUTHOR", "READER"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

export { signupSchema, loginSchema };
