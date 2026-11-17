import "dotenv/config";
import { firebaseAuth } from "../src/config/firebaseAdmin.js";

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: node scripts/set-admin.js FIREBASE_UID");
  process.exitCode = 1;
} else {
  try {
    const user = await firebaseAuth.getUser(uid);
    await firebaseAuth.setCustomUserClaims(uid, {
      ...(user.customClaims ?? {}),
      admin: true
    });
    console.log("Admin claim assigned to the requested Firebase user.");
  } catch {
    console.error("Unable to assign the admin claim. Check the UID and server credentials.");
    process.exitCode = 1;
  }
}
