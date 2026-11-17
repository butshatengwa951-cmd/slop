import express from "express";
import cors from "cors";
import attendanceRouter from "./routes/attendance.routes.js";

// Create the Express application. server.js starts listening for requests;
// separating app creation makes it easier to import the app in future tests.
const app = express();

// The React/Vite development server has its own origin (host + port).
// Browsers enforce CORS when frontend code calls an API on another origin.
const frontendUrl = process.env.FRONTEND_URL;

// Do not expose the default Express technology-identifying response header.
app.disable("x-powered-by");

// Allow browser calls only from the configured frontend origin.
// "false" fails closed when FRONTEND_URL is missing; it does not allow every site.
// Authorization is listed because the frontend sends the Firebase ID token there.
app.use(cors({
  origin: frontendUrl || false,
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"]
}));

// Parse JSON request bodies with a small limit to avoid accepting oversized bodies.
// The current protected endpoint is a GET and does not use a request body.
app.use(express.json({ limit: "16kb" }));

// Mount attendance routes. The router adds "/live" to this shared prefix.
app.use("/api/attendance", attendanceRouter);

// This runs when no earlier route matched. JSON is easier for a frontend to
// handle consistently than Express's default HTML 404 response.
app.use((req, res) => res.status(404).json({
  error: {
    code: "ROUTE_NOT_FOUND",
    message: "The requested endpoint was not found."
  }
}));

export default app;
