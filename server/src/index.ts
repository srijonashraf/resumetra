import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api";
import { testConnection } from "./config/database";
import { requireEnv } from "./utils";

dotenv.config();

const app = express();
const port = requireEnv("PORT");

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await testConnection();
});
