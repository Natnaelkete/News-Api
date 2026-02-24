import { prisma } from "../config/database";
import type { Article, ArticleStatus, Prisma } from "@prisma/client";

type CreateArticleInput = {
  title: string;
  content: string;
  category: string;
};

type UpdateArticleInput = {
  title?: string;
  content?: string;
  category?: string;
  status?: ArticleStatus;
};

const createArticle = async (
  authorId: string,
  input: CreateArticleInput,
): Promise<Article> => {
  return prisma.article.create({
    data: {
      title: input.title,
      content: input.content,
      category: input.category,
      status: "DRAFT",
      authorId,
    },
  });
};

const getAuthorArticles = async (
  authorId: string,
  page: number,
  size: number,
): Promise<{ items: Article[]; total: number }> => {
  const where = { authorId, deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total };
};

const updateArticle = async (
  authorId: string,
  articleId: string,
  input: UpdateArticleInput,
): Promise<Article> => {
  const article = await prisma.article.findFirst({
    where: { id: articleId, authorId, deletedAt: null },
  });

  if (!article) {
    const error = new Error("Article not found") as Error & {
      status?: number;
      errors?: string[];
    };
    error.status = 404;
    error.errors = ["Article not found"];
    throw error;
  }

  return prisma.article.update({
    where: { id: articleId },
    data: {
      title: input.title,
      content: input.content,
      category: input.category,
      status: input.status,
    },
  });
};

const softDeleteArticle = async (
  authorId: string,
  articleId: string,
): Promise<void> => {
  const article = await prisma.article.findFirst({
    where: { id: articleId, authorId, deletedAt: null },
  });

  if (!article) {
    const error = new Error("Article not found") as Error & {
      status?: number;
      errors?: string[];
    };
    error.status = 404;
    error.errors = ["Article not found"];
    throw error;
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { deletedAt: new Date() },
  });
};

export { createArticle, getAuthorArticles, updateArticle, softDeleteArticle };

type PublicFeedFilters = {
  category?: string;
  author?: string;
  q?: string;
};

type PublicArticle = Prisma.ArticleGetPayload<{
  include: {
    author: {
      select: { id: true; name: true };
    };
  };
}>;

const getPublicArticles = async (
  filters: PublicFeedFilters,
  page: number,
  size: number,
): Promise<{ items: PublicArticle[]; total: number }> => {
  const where = {
    status: "PUBLISHED" as ArticleStatus,
    deletedAt: null,
    category: filters.category,
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { content: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.author
      ? {
          author: { name: { contains: filters.author, mode: "insensitive" } },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total };
};

const getPublicArticleById = async (
  articleId: string,
): Promise<PublicArticle> => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "PUBLISHED",
      deletedAt: null,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  if (!article) {
    const error = new Error("News article no longer available") as Error & {
      status?: number;
      errors?: string[];
    };
    error.status = 404;
    error.errors = ["News article no longer available"];
    throw error;
  }

  return article;
};

export { getPublicArticles, getPublicArticleById };
