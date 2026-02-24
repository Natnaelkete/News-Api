import { Router } from "express";
import { getDashboardHandler } from "../controllers/authorController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

router.get("/dashboard", authenticate, requireRole("AUTHOR"), getDashboardHandler);

export default router;
