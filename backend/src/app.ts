import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import articleRoutes from "./routes/articles";
import authorRoutes from "./routes/author";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";
import { sanitizeInput } from "./middleware/sanitize";

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

app.use(helmet());
app.use(
  cors({
    origin:
      corsOrigins.length === 0 || corsOrigins.includes("*")
        ? true
        : corsOrigins,
  })
);
app.use(express.json());
app.use(sanitizeInput);
app.use(apiLimiter);

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/author", authorRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.json({ message: "News API running" });
});

app.use(errorHandler);

export default app;
