// Load .env values before the app reads settings such as FRONTEND_URL.
// In production, set these values in the hosting provider instead.
import "dotenv/config";
import app from "./app.js";

// Both backend alternatives use port 5000. They are not intended to run
// simultaneously; stop one server before starting the other.
const port = Number(process.env.PORT || 5000);

// Start the local mock backend. Firebase authentication is still real;
// only the future attendance data source is intended to be mocked.
app.listen(port, () => {
  console.log("Mock attendance API listening on port " + port);
});
