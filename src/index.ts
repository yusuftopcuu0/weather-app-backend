import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import weatherRouter from "./routes/weather";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/weather", weatherRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Weather proxy listening on port ${PORT}`);
});
