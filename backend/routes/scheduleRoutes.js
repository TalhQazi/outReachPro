import express from "express";
const router = express.Router();
import ScheduledEmail from "../models/schedule.js";
import dotenv from "dotenv";

dotenv.config()


router.post("/scheduleEmails", async (req, res) => {
  try {
    const { recipients, subject, message, scheduleTime, sheet_id, accessToken } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    for (const recipient of recipients) {
      if (recipient.Email === "") {
        continue;
      }

      const email = new ScheduledEmail({
        recipient: recipient.Email,
        subject,
        message,
        scheduleTime: new Date(scheduleTime),
        sheet_id,
        accessToken
      });

      await email.save();
      console.log("Email scheduled successfully for:", email.recipient);
    }
    res.status(200).json({ message: "All emails scheduled successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to schedule emails." });
  }
});

export default router;
