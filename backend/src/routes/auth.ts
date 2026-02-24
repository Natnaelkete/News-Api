import { Router } from "express";
import { signupHandler, loginHandler } from "../controllers/authController";
import { signupSchema, loginSchema } from "../config/validation";
import { validate } from "../middleware/validation";
import { signupLimiter, loginLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/signup", signupLimiter, validate(signupSchema), signupHandler);
router.post("/login", loginLimiter, validate(loginSchema), loginHandler);

export default router;
