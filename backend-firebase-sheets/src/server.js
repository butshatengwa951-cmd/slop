// Load key/value settings from .env before starting the application.
// In production, the hosting platform should provide environment variables.
import "dotenv/config";
import app from "./app.js";

// Use PORT from the environment. The fallback keeps local development on 5000.
// Both backend variants share this port because they are alternatives;
// run only one of them at a time.
const port = Number(process.env.PORT || 5000);

// Start the HTTP server. Authentication is attached to protected routes,
// rather than applied globally to routes that may later be public.
app.listen(port, () => {
  console.log("Attendance API listening on port " + port);
});
