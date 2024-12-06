import { useEffect, useState } from "react";
import { initializeGmailAPI, sendEmail } from "../../Services/gmailApi";
import { updateEmailStatusInSheet } from "../../Services/sheetsAPI";
import applyMergeFields from "../MailMerge/appyMergeField";
import EmailScheduler from "./EmailScheduler";
import axios from "axios";

const saveScheduleEmail = async (
  emailData,
  subject,
  message,
  scheduledTime,
  sheet_id,
  accessToken
) => {
  // console.log(emailData, subject, message, scheduledTime);
  const data = {
    recipients: emailData,
    subject: subject,
    message: message,
    scheduleTime: scheduledTime,
    sheet_id,
    accessToken,
  };
  console.log(data);
  const res = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/schedule/scheduleEmails`,
    data
  );
  if (res.ok) {
    alert("Messages scheduled successfully!");
  }
};
const ScheduleManager = ({
  emailData,
  template,
  subject,
  fieldMapp,
  onEmailsSent,
}) => {
  const [scheduledEmails, setScheduledEmails] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeGmailAPI(); // Initialize Gmail API before scheduling
      } catch (error) {
        console.error("Error initializing Gmail API:", error);
      }
    };
    initialize();
  }, []);

  const handleSchedule = async (scheduledDate) => {
    const accessToken = sessionStorage.getItem("access_token");
    const sheet_id = sessionStorage.getItem("sheet_id");

    const emailQueue = emailData.map((recipient) => ({
      recipient,
      scheduledDate,
    }));
    setScheduledEmails([...scheduledEmails, ...emailQueue]);

    // Log scheduled emails to Google Sheets
    // for (const { recipient } of emailQueue) {
    //   try {
    //     await updateEmailStatusInSheet(
    //       recipient.Email,
    //       "Scheduled",

    //       scheduledDate.toISOString(),
    //       "No-Reply",
    //       accessToken
    //     );
    //   } catch (error) {
    //     console.error("Failed to log scheduled email to Google Sheets:", error);
    //   }
    // }

    // Schedule each email to be sent at the specified time

    sendScheduledEmail(emailData, scheduledDate, sheet_id, accessToken);
  };

  const sendScheduledEmail = async (
    emailData,
    scheduledDate,
    sheet_id,
    accessToken
  ) => {
    try {
      // const personalizedEmail = applyMergeFields(
      //   template,
      //   recipient,
      //   fieldMapping
      // );
      // console.log(`Sending email to: ${recipient.Email}`); // Debug log
      // console.log("Hello from frontend!", emailData, subject, scheduledDate);
      await saveScheduleEmail(
        emailData,
        subject,
        template,
        scheduledDate,
        sheet_id,
        accessToken
      );
      // console.log(`Scheduled email sent to: ${recipient.Email}`);

      // Update Google Sheets with "Sent" status after successful email send
      // const accessToken = sessionStorage.getItem("access_token");
      // await updateEmailStatusInSheet(
      //   recipient.Email,
      //   "Sent",
      //   new Date().toISOString(),
      //   "No-Reply",
      //   accessToken
      // );
      // emailData.forEach(element => {
      //   onEmailsSent(element.Email);
      // });
    } catch (error) {
      console.error("Error sending scheduled email to", error);

      // Update Google Sheets with "Failed" status if sending fails
      // const accessToken = sessionStorage.getItem("access_token");
      // await updateEmailStatusInSheet(
      //   recipient.Email,
      //   "Failed",
      //   "Error",
      //   "No-Reply",
      //   accessToken
      // );
    }
  };

  return (
    <div className="p-4 mt-6 bg-white border border-gray-300 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold">Scheduled Emails</h3>
      <EmailScheduler onSchedule={handleSchedule} />
    </div>
  );
};

export default ScheduleManager;
