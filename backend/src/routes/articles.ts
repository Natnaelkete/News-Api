import { Router } from "express";
import {
	createArticleHandler,
	deleteArticleHandler,
	getMyArticlesHandler,
	updateArticleHandler,
} from "../controllers/articleController";
import {
	createArticleSchema,
	updateArticleSchema,
} from "../config/validation";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

router.use(authenticate, requireRole("AUTHOR"));

router.post("/", validate(createArticleSchema), createArticleHandler);
router.get("/me", getMyArticlesHandler);
router.put("/:id", validate(updateArticleSchema), updateArticleHandler);
router.delete("/:id", deleteArticleHandler);

export default router;
