import express from "express";
import attendanceRouter from "./routes/attendance.routes.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use("/api/attendance", attendanceRouter);

app.use((req, res) => res.status(404).json({
  error: {
    code: "ROUTE_NOT_FOUND",
    message: "The requested endpoint was not found."
  }
}));

export default app;
