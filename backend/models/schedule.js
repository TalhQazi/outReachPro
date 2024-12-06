import mongoose from "mongoose";

const ScheduledEmailSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  subject: { type: String, default: " " },
  message: { type: String, default: " " },
  scheduleTime: { type: Date, required: true },
  status: { type: String, default: "pending" },
  sheet_id: { type: String, required: true },
  accessToken: { type: String, required: true },
});

const schedule = mongoose.model("ScheduledEmail", ScheduledEmailSchema);
export default schedule;
