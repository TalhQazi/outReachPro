import { gapi } from "gapi-script";
import axios from "axios";

export const initializeGmailAPI = () => {
  if (window.gapi.auth2 && window.gapi.auth2.getAuthInstance()) {
    return Promise.resolve(); // Return immediately if already initialized
  }
  const scopes = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.compose",
  ].join(" ");
  return new Promise((resolve, reject) => {
    window.gapi.load("client:auth2", async () => {
      try {
        await window.gapi.client.init({
          apiKey: import.meta.env.VITE_API_KEY,
          clientId: import.meta.env.VITE_CLIENT_ID,
          clientSecret: import.meta.env.VITE_CLIENT_SECRET,
          redirectUri: import.meta.env.VITE_REDIRECT_URI,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
          ],
          scope: scopes,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

//Send Single Mail

export const sendSingleEmail = async (recipient, subject, message, delay) => {
  try {
    const data = {
      recipient: recipient,
      subject: subject,
      message: message,
      delay,
    };
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/mails/sendSingleEmail`,
      data
    );
    // console.log(response)
    if (!response.ok) {
      return false;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; // Rethrow the error for further handling
  }
};

// Send Bulk email
export const sendEmail = async (
  recipient,
  subject,
  message,
  recipients,
  delay,
  sheet_id,
  accessToken
) => {
  // if (!window.gapi || !window.gapi.client || !window.gapi.client.gmail) {
  //   throw new Error("Gmail API not initialized.");
  // }

  // const email = [
  //   `To: ${recipient}`,
  //   `Subject: ${subject}`,
  //   `Content-Type: text/html; charset="UTF-8"`,
  //   ``,
  //   message,
  // ].join("\n");

  // const base64EncodedEmail = window
  //   .btoa(email)
  //   .replace(/\+/g, "-")
  //   .replace(/\//g, "_");

  // const request = {
  //   userId: "me", // "me" indicates the authenticated user
  //   resource: {
  //     raw: base64EncodedEmail,
  //   },
  // };

  try {
    const data = {
      recipients: recipients,
      subject: subject,
      message: message,
      delay: delay,
      sheet_id: sheet_id,
      accessToken: accessToken,
    };
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/mails/sendBulkEmail`,
      data
    );

    if (!response.ok) {
      return false;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; // Rethrow the error for further handling
  }
};

// Bulk email function
export const sendBulkEmails = async (recipients, subject, message) => {
  for (let recipient of recipients) {
    try {
      await sendEmail(recipient, subject, message);
      console.log(`Email sent to ${recipient}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient}:`, error);
    }
  }
};

// Fetch recent emails
export const fetchRecentEmails = async () => {
  const user = window.gapi.auth2.getAuthInstance().currentUser.get();
  const authResponse = user.getAuthResponse();
  const accessToken = authResponse.access_token;

  const response = await window.gapi.client.gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });

  const messages = response.result.messages;
  const emailPromises = messages.map(async (message) => {
    const msgResponse = await window.gapi.client.gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });
    const headers = msgResponse.result.payload.headers;

    const emailDetails = {
      sender: headers.find((h) => h.name === "From").value,
      senderName: headers
        .find((h) => h.name === "From")
        .value.split("<")[0]
        .trim(),
      subject: headers.find((h) => h.name === "Subject").value,
    };

    return emailDetails;
  });

  return Promise.all(emailPromises);
};

// Get list of drafts
export const listDrafts = async () => {
  const response = await window.gapi.client.gmail.users.drafts.list({
    userId: "me",
  });

  if (response && response.result && response.result.drafts) {
    const draftDetails = await Promise.all(
      response.result.drafts.map(async (draft) => {
        const draftResponse = await window.gapi.client.gmail.users.drafts.get({
          userId: "me",
          id: draft.id,
        });
        const message = draftResponse.result.message;
        const headers = message.payload.headers;

        const subjectHeader = headers.find(
          (header) => header.name === "Subject"
        );
        const subject = subjectHeader ? subjectHeader.value : "No Subject";

        let body = "";
        if (message.payload.parts) {
          const part = message.payload.parts.find(
            (part) => part.mimeType === "text/html"
          );
          body = part
            ? window.atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))
            : "No Body";
        } else if (message.payload.body) {
          body = window.atob(
            message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/")
          );
        }

        return {
          id: draft.id,
          subject: subject,
          body: body || "No Body",
        };
      })
    );

    return draftDetails;
  } else {
    console.log("No drafts found or error in fetching drafts.");
    return [];
  }
};

// Send draft to a specified recipient
export const sendDraft = async (auth, draftId, recipientEmail) => {
  try {
    const draftContent = await getDraft(draftId);

    const rawMessage = draftContent.message.raw;
    const decodedMessage = atob(
      rawMessage.replace(/-/g, "+").replace(/_/g, "/")
    );

    const updatedMessage = decodedMessage.replace(
      /To: .*\r\n/,
      `To: ${recipientEmail}\r\n`
    );

    const base64EncodedEmail = btoa(updatedMessage)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await window.gapi.client.gmail.users.messages.send({
      userId: "me",
      resource: {
        raw: base64EncodedEmail,
      },
    });
  } catch (error) {
    console.error("Error sending draft:", error);
    throw new Error("Failed to send email.");
  }
};
