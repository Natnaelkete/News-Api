import express from "express";
import authRoutes from "./routes/auth";
import articleRoutes from "./routes/articles";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "News API running" });
});

app.use(errorHandler);

export default app;
