import express from "express";
import { google } from "googleapis";
import base64url from "base64url";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Utility function for delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/sendBulkEmail", async (req, res) => {
  const { subject, message, recipients, delay, sheet_id, accessToken } =
    req.body;

  // Log recipients for debugging
  console.log("Recipients received:", recipients);

  // Validate recipients
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid or missing 'recipients' field" });
  }

  // Validate delay
  if (!delay || delay < 0) {
    return res
      .status(400)
      .json({ message: "Invalid delay value. Must be a positive number." });
  }

  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    for (let recipient of recipients) {
      if (!recipient.Email) {
        console.error("Invalid recipient:", recipient);
        continue; // Skip if Email is missing
      }

      const email = [
        `To: ${recipient.Email}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset="UTF-8"`,
        ``,
        message,
      ].join("\n");

      const base64EncodedEmail = base64url(email);

      const request = {
        userId: "me",
        resource: {
          raw: base64EncodedEmail,
        },
      };

      await gmail.users.messages.send(request);
      console.log(
        `Email sent to ${recipient.Email} at ${new Date().toISOString()}`
      );
      const status = "Sent";
      const responded = "no-reply";
      const open = "no";
      const values = [
        [recipient.Email, status, open, responded, new Date().toISOString()],
      ];
      const body = {
        values,
      };

      // Use only the sheet name for dynamic appending
      const range = "Sent Emails";

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

        if (!response.ok) {
          console.log("Failed to update email status:", res.data);
          // return res.status(response.status).send(res.data);
        }
      } catch (error) {
        console.log("Error updating email status:", error);
      }
      // Add delay before next email
      if (recipients.indexOf(recipient) < recipients.length - 1) {
        // Don't delay after last email
        console.log(`Waiting for ${delay}ms before sending next email...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Delay complete at ${new Date().toISOString()}`);
      }
    }
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Error sending emails in mail routes!" });
  }
});

// router.post("/sendSingleEmail", async (req, res) => {
//     const { recipient, subject, message, delay } = req.body;
//     console.log("Recipient received:", recipient);

//     // Validate delay
//     if (!delay || delay < 0) {
//         return res.status(400).json({ message: "Invalid delay value. Must be a positive number." });
//     }

//     oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
//     const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

//     try {
//         if (recipient.Email === undefined) {
//             console.error("Invalid recipient:", recipient);
//         }

//         const email = [
//             `To: ${recipient.Email}`,
//             `Subject: ${subject}`,
//             `Content-Type: text/html; charset="UTF-8"`,
//             ``,
//             message,
//         ].join("\n");

//         const base64EncodedEmail = base64url(email);

//         const request = {
//             userId: "me",
//             resource: {
//                 raw: base64EncodedEmail,
//             },
//         };

//         await gmail.users.messages.send(request);
//         console.log(`Email sent to ${recipient.Email} at ${new Date().toISOString()}`);

//         // Add delay before next email

//         console.log(`Waiting for ${delay}ms before sending next email...`);
//         await new Promise(resolve => setTimeout(resolve, delay));

//         res.status(200).json({ message: "Emails sent successfully" });
//     } catch (error) {
//         console.error("Error sending emails:", error);
//         res.status(500).json({ message: "Error sending emails in mail routes!" });
//     }
// })

export default router;
