import React, { useState } from "react";
import { initializeGmailAPI } from "../../Services/gmailApi"; // Your Google API service
import {
  createSpreadsheet,
  updateSpreadsheetWithStatus,
} from "../../Services/sheetsAPI"; // Existing imports
import { sendEmail } from "../../Services/gmailApi"; // Existing imports

const EmailCampaign = () => {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [csvFile, setCsvFile] = useState(null); // State for CSV file
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCampaign = async () => {
    setLoading(true);
    setError("");

    // Parse recipients
    const recipientList = recipients.split(",").map((email) => email.trim());

    try {
      await initializeGmailAPI();

      // Use the name of the uploaded CSV file as the spreadsheet name
      const spreadsheetName = csvFile
        ? csvFile.name.replace(/\.csv$/, "")
        : "Email Campaign";

      const accessToken = sessionStorage.getItem("access_token");
      const { spreadsheetId } = await createSpreadsheet(accessToken,spreadsheetName);
      // console.log(spreadsheetUrl);
      const emailStatuses = await Promise.all(
        recipientList.map(async (recipient) => {
          return await sendEmail(recipient, subject, message);
        })
      );

      await updateSpreadsheetWithStatus(spreadsheetId, emailStatuses);

      alert("Emails sent and spreadsheet updated successfully!");
    } catch (error) {
      console.error("Error running email campaign:", error);
      setError("Failed to send emails. Please check your configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      alert("Please upload a valid CSV file.");
      setCsvFile(null);
    }
  };

  return (
    <div>
      <h2>Email Campaign</h2>
      <input
        type="text"
        placeholder="Recipients (comma-separated)"
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleSendCampaign} disabled={loading}>
        {loading ? "Sending..." : "Send Campaign"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default EmailCampaign;
