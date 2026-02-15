import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import apiRouter from "./routes/api";
import { testConnection } from "./config/database";
import { requireEnv } from "./utils";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

const app = express();
const port = requireEnv("PORT");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://resume-radar-three.vercel.app"],
    credentials: true,
    maxAge: 86400,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many analysis requests, please try again later.",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
});

app.use("/api/v1", apiRouter);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await testConnection();
});
