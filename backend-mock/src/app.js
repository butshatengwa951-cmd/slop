import express from "express";
import cors from "cors";
import attendanceRouter from "./routes/attendance.routes.js";

// Build the Express app separately from server startup so it can be imported
// by tests or other tooling without automatically opening a network port.
const app = express();

// Vite serves the React frontend on a separate origin during local development.
// CORS controls which browser origin is allowed to call this backend.
const frontendUrl = process.env.FRONTEND_URL;

// Hide Express's default technology header.
app.disable("x-powered-by");

// Allow only the configured frontend origin. If FRONTEND_URL is missing,
// the browser origin is not allowed (fail closed). Authorization is required
// because React sends the Firebase ID token in that header.
app.use(cors({
  origin: frontendUrl || false,
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"]
}));

// Parse JSON bodies with a small size limit. The current GET endpoint has no body,
// but JSON parsing will be useful for future API routes.
app.use(express.json({ limit: "16kb" }));

// Prefix every route in attendanceRouter with /api/attendance.
app.use("/api/attendance", attendanceRouter);

// Keep unmatched endpoint errors in a predictable JSON format for React.
app.use((req, res) => res.status(404).json({
  error: {
    code: "ROUTE_NOT_FOUND",
    message: "The requested endpoint was not found."
  }
}));

export default app;
