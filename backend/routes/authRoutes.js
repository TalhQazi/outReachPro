import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config()

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Redirect URI endpoint
router.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  console.log(process.env.CLIENT_ID)
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
    // process.env.refresh_token
    process.env.REFRESH_TOKEN = tokens.refresh_token
    // Save tokens or proceed
    res.send("Authorization successful! You can close this window.");
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).send("Authentication failed.");
  }
});

export default router;
