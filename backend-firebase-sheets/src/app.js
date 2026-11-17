import express from "express";
import cors from "cors";
import attendanceRouter from "./routes/attendance.routes.js";

const app = express();
const frontendUrl = process.env.FRONTEND_URL;

app.disable("x-powered-by");
app.use(cors({
  origin: frontendUrl || false,
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"]
}));
app.use(express.json({ limit: "16kb" }));
app.use("/api/attendance", attendanceRouter);

app.use((req, res) => res.status(404).json({
  error: {
    code: "ROUTE_NOT_FOUND",
    message: "The requested endpoint was not found."
  }
}));

export default app;
