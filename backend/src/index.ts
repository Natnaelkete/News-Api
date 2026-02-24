import app from "./app";
import { connectDatabase } from "./config/database";

const port = Number(process.env.PORT) || 3000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
