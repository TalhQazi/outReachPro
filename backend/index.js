import { google } from "googleapis";
import dotenv from "dotenv";
import express from "express";
import draftRouter from "./routes/draftRoutes.js";
import mailRouter from "./routes/mailRoutes.js";
import cors from "cors";
import mongoose from "mongoose";
import cron from "node-cron";
import base64url from "base64url";
import ScheduledEmail from "./models/schedule.js";
import scheduleRouter from "./routes/scheduleRoutes.js";
import sheetRouter from "./routes/sheetRoutes.js";
import authRouter from "./routes/authRoutes.js";
// Load environment variables
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const app = express();
// Allow specific origin
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());

const mongoDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://outreach:outreach@cluster0.ac6gf.mongodb.net/outreach"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

mongoDb();

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function sendEmail(recipient, subject, message) {
  const email = [
    `To: ${recipient}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    message,
  ].join("\n");

  const encodedEmail = base64url(email);

  await gmail.users.messages.send({
    userId: "me",
    resource: {
      raw: encodedEmail,
    },
  });
}

// Cron job to send scheduled emails
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log(`Checking for emails to send at ${now}`);

    // Normalize current time to the minute (remove seconds and milliseconds)
    const nowRounded = new Date(Math.floor(now.getTime() / 60000) * 60000); // Round to nearest minute

    // Fetch emails that are scheduled for the exact current time and are pending
    const emailsToSend = await ScheduledEmail.find({
      scheduleTime: nowRounded, // Match the exact time
      status: "pending",
    });

    console.log("Found emails to send:", emailsToSend);

    for (const email of emailsToSend) {
      try {
        console.log(
          `Sending email to ${email.recipient} scheduled for ${email.scheduleTime}`
        );
        await sendEmail(email.recipient, email.subject, email.message);

        // Mark the email as sent
        email.status = "sent";
        await email.save();
        const status = "Sent";
        const responded = "no-reply";
        const open = "no";
        const values = [
          [email.recipient, status, open, responded, new Date().toISOString()],
        ];
        const body = {
          values,
        };

        // Use only the sheet name for dynamic appending
        const range = "Sent Emails";
        const accessToken = email.accessToken;
        const sheet_id = email.sheet_id;
        // console.log(accessToken, sheet_id)
        try {
          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${range}:append?valueInputOption=USER_ENTERED&access_token=${accessToken}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );
          const data = await response.json();
          console.log("Successfully updated email status:", data);
          if (!response.ok) {
            console.log("Failed to update email status:", response.data);
            // return res.status(response.status).send(res.data);
          }
        } catch (error) {
          console.log("Error updating email status:", error);
        }

        console.log(`Email sent to ${email.recipient}`);
      } catch (err) {
        console.error(`Failed to send email to ${email.recipient}:`, err);

        // Mark the email as failed
        email.status = "failed";
        await email.save();
      }
    }
  } catch (error) {
    console.error("Error processing scheduled emails:", error);
  }
});

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
];

const getAuthURL = () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
};

getAuthURL();

app.use("/", authRouter);
app.use("/drafts", draftRouter);
app.use("/mails", mailRouter);
app.use("/schedule", scheduleRouter);
app.use("/sheets", sheetRouter);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
