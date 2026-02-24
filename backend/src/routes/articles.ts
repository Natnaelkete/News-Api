import { Router } from "express";
import {
  createArticleHandler,
  deleteArticleHandler,
  getMyArticlesHandler,
  getPublicArticleHandler,
  getPublicArticlesHandler,
  updateArticleHandler,
} from "../controllers/articleController";
import { createArticleSchema, updateArticleSchema } from "../config/validation";
import { validate } from "../middleware/validation";
import { authenticate, optionalAuthenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

router.get("/", getPublicArticlesHandler);
router.get("/me", authenticate, requireRole("AUTHOR"), getMyArticlesHandler);
router.post(
  "/",
  authenticate,
  requireRole("AUTHOR"),
  validate(createArticleSchema),
  createArticleHandler,
);
router.put(
  "/:id",
  authenticate,
  requireRole("AUTHOR"),
  validate(updateArticleSchema),
  updateArticleHandler,
);
router.delete(
  "/:id",
  authenticate,
  requireRole("AUTHOR"),
  deleteArticleHandler,
);
router.get("/:id", optionalAuthenticate, getPublicArticleHandler);

export default router;
