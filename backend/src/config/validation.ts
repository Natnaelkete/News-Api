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

const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be 1-150 characters")
    .max(150, "Title must be 1-150 characters"),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters"),
});

const updateArticleSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be 1-150 characters")
    .max(150, "Title must be 1-150 characters")
    .optional(),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .optional(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters")
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

const paginationSchema = z.object({
  page: z
    .preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().min(1)
    )
    .default(1),
  size: z
    .preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().min(1).max(50)
    )
    .default(10),
});

const articleIdSchema = z.object({
  id: z.string().uuid("Article id must be a valid UUID"),
});

const publicFeedSchema = paginationSchema.extend({
  category: z.string().min(1).max(50).optional(),
  author: z.string().min(1).max(100).optional(),
  q: z.string().min(1).max(200).optional(),
});

export {
  signupSchema,
  loginSchema,
  createArticleSchema,
  updateArticleSchema,
  paginationSchema,
  articleIdSchema,
  publicFeedSchema,
};
