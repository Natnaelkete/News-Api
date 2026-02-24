import express from "express";
import authRoutes from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "News API running" });
});

app.use(errorHandler);

export default app;
